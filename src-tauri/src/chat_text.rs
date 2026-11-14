//! Chat-style text cleanup for game chat: removing commas and shortening
//! common phrases to chat abbreviations ("to be honest" -> "tbh",
//! "looking for group" -> "LFG").
//!
//! Plain word matching, no regular expressions: the text is split into
//! words, and phrases are matched word by word, ignoring case. Each phrase
//! lists the ways people actually say it, including the words around it
//! that the abbreviation already covers ("I'm not gonna lie" -> "ngl", not
//! "I'm ngl"). The longest match wins.

use once_cell::sync::Lazy;

/// Phrase templates and their abbreviations. In a template, `[a|b|c]` means
/// "one of these" and an empty choice (`[|a]`) makes the words optional.
const ABBREVIATIONS: &[(&str, &str)] = &[
    // Everyday chat
    ("[|i'm|i am|im] [|just] not [gonna|going to] lie", "ngl"),
    ("[|i'm|i am] [|just] [being] honest", "tbh"),
    ("to be honest", "tbh"),
    ("to be fair", "tbf"),
    ("in my honest opinion", "imho"),
    ("in my opinion", "imo"),
    ("by the way", "btw"),
    ("oh my [god|gosh]", "omg"),
    ("[i don't know|i do not know|i dunno|dunno]", "idk"),
    ("right now", "rn"),
    (
        "[|i'll|i will|i'm gonna|i am going to|gonna] be right back",
        "brb",
    ),
    ("[|i'm|i am] away from [|the] keyboard", "afk"),
    ("good game", "gg"),
    ("well played", "wp"),
    ("good luck have fun", "glhf"),
    ("good luck", "gl"),
    ("thank you [|so much|very much]", "ty"),
    ("[you're|you are] welcome", "yw"),
    ("no problem", "np"),
    ("talk to you later", "ttyl"),
    ("[|i'm|i am] on my way", "omw"),
    ("as far as i know", "afaik"),
    ("for what it's worth", "fwiw"),
    ("if i [remember|recall] correctly", "iirc"),
    ("never mind", "nvm"),
    ("let me know", "lmk"),
    ("in real life", "irl"),
    ("for real", "fr"),
    ("laughing out loud", "lol"),
    ("too long didn't read", "tldr"),
    // World of Warcraft
    (
        "[|i'm|i am|we're|we are] looking for [|a|another] group",
        "LFG",
    ),
    ("[|i'm|i am|we're|we are] looking for more", "LFM"),
    // "We're looking for a healer" -> "LF healer"; needs a subject, so "I was
    // looking for you" is left alone.
    (
        "[i'm|i am|we're|we are|we're still|we are still] looking for [|a|an|one|another|some]",
        "LF",
    ),
    ("[|i] [want to|wanna|willing to] sell", "WTS"),
    ("[|i] [want to|wanna|willing to] buy", "WTB"),
    ("[|i] [want to|wanna|willing to] trade", "WTT"),
    ("incoming", "inc"),
    ("[|i'm|i am] out of mana", "oom"),
    ("line of sight", "LoS"),
    ("crowd control", "CC"),
    ("area of effect", "AoE"),
    ("damage per second", "DPS"),
    ("[resurrect|resurrection]", "rez"),
];

/// Expands a template into every wording it allows.
fn expand(template: &str) -> Vec<Vec<String>> {
    // Split into literal text and [a|b] groups.
    let mut parts: Vec<Vec<String>> = Vec::new();
    let mut rest = template;
    while !rest.is_empty() {
        if let Some(start) = rest.find('[') {
            if start > 0 {
                parts.push(vec![rest[..start].to_string()]);
            }
            let end = rest[start..]
                .find(']')
                .map(|e| start + e)
                .unwrap_or(rest.len() - 1);
            parts.push(
                rest[start + 1..end]
                    .split('|')
                    .map(str::to_string)
                    .collect(),
            );
            rest = &rest[end + 1..];
        } else {
            parts.push(vec![rest.to_string()]);
            rest = "";
        }
    }
    let mut phrases = vec![String::new()];
    for choices in parts {
        let mut next = Vec::new();
        for prefix in &phrases {
            for choice in &choices {
                next.push(format!("{} {}", prefix, choice));
            }
        }
        phrases = next;
    }
    let mut out: Vec<Vec<String>> = phrases
        .iter()
        .map(|p| p.split_whitespace().map(str::to_string).collect::<Vec<_>>())
        .filter(|words| !words.is_empty())
        .collect();
    out.sort();
    out.dedup();
    out
}

/// Every wording, longest first, with its abbreviation.
static PHRASES: Lazy<Vec<(Vec<String>, &'static str)>> = Lazy::new(|| {
    let mut all: Vec<(Vec<String>, &'static str)> = ABBREVIATIONS
        .iter()
        .flat_map(|(template, abbr)| expand(template).into_iter().map(move |w| (w, *abbr)))
        .collect();
    all.sort_by(|a, b| b.0.len().cmp(&a.0.len()));
    all
});

/// A word plus any punctuation stuck to its front or back.
struct Token {
    lead: String,
    core: String,
    trail: String,
}

fn is_edge_punct(c: char) -> bool {
    !c.is_alphanumeric() && c != '\'' && c != '\u{2019}'
}

fn tokenize(text: &str) -> Vec<Token> {
    text.split_whitespace()
        .map(|raw| {
            let start = raw.find(|c: char| !is_edge_punct(c)).unwrap_or(raw.len());
            let end = raw
                .rfind(|c: char| !is_edge_punct(c))
                .map(|i| i + raw[i..].chars().next().map_or(1, char::len_utf8))
                .unwrap_or(start);
            let end = end.max(start);
            Token {
                lead: raw[..start].to_string(),
                core: raw[start..end].to_string(),
                trail: raw[end..].to_string(),
            }
        })
        .collect()
}

fn normalize(word: &str) -> String {
    word.to_lowercase().replace('\u{2019}', "'")
}

/// Shortens common phrases to chat abbreviations. Punctuation around a phrase
/// is kept ("To be honest, it's fine" -> "tbh, it's fine"); a phrase broken by
/// punctuation inside it isn't matched.
pub fn abbreviate(text: &str) -> String {
    let tokens = tokenize(text);
    let words: Vec<String> = tokens.iter().map(|t| normalize(&t.core)).collect();
    let mut out: Vec<String> = Vec::new();
    let mut i = 0;
    'outer: while i < tokens.len() {
        for (phrase, abbr) in PHRASES.iter() {
            let n = phrase.len();
            if i + n > tokens.len() || words[i..i + n] != phrase[..] {
                continue;
            }
            // No punctuation between the phrase's words.
            let clean_inside = (i..i + n).all(|k| {
                (k == i || tokens[k].lead.is_empty())
                    && (k == i + n - 1 || tokens[k].trail.is_empty())
            });
            if !clean_inside {
                continue;
            }
            out.push(format!(
                "{}{}{}",
                tokens[i].lead,
                abbr,
                tokens[i + n - 1].trail
            ));
            i += n;
            continue 'outer;
        }
        let t = &tokens[i];
        out.push(format!("{}{}{}", t.lead, t.core, t.trail));
        i += 1;
    }
    out.join(" ")
}

/// Removes commas, except between digits ("1,000" stays).
pub fn remove_commas(text: &str) -> String {
    let chars: Vec<char> = text.chars().collect();
    let mut out = String::with_capacity(text.len());
    for (i, &c) in chars.iter().enumerate() {
        if c == ',' || c == '\u{FF0C}' {
            let digit_before = i > 0 && chars[i - 1].is_ascii_digit();
            let digit_after = chars.get(i + 1).is_some_and(|n| n.is_ascii_digit());
            if c == ',' && digit_before && digit_after {
                out.push(c);
            }
            continue;
        }
        out.push(c);
    }
    out.split_whitespace().collect::<Vec<_>>().join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn abbreviates_and_swallows_filler_words() {
        assert_eq!(
            abbreviate("I'm not gonna lie, that was close"),
            "ngl, that was close"
        );
        assert_eq!(
            abbreviate("I am not going to lie that boss hurt"),
            "ngl that boss hurt"
        );
        assert_eq!(abbreviate("Not gonna lie, nice"), "ngl, nice");
        assert_eq!(
            abbreviate("To be honest, I think we wipe."),
            "tbh, I think we wipe."
        );
        assert_eq!(abbreviate("I'll be right back."), "brb.");
        assert_eq!(
            abbreviate("I don't know, by the way where is it?"),
            "idk, btw where is it?"
        );
        assert_eq!(abbreviate("Thank you so much!"), "ty!");
    }

    #[test]
    fn wow_terms() {
        assert_eq!(abbreviate("Looking for group Deadmines"), "LFG Deadmines");
        assert_eq!(
            abbreviate("We're looking for a healer for Stockades"),
            "LF healer for Stockades"
        );
        assert_eq!(abbreviate("Want to sell copper ore"), "WTS copper ore");
        assert_eq!(abbreviate("Incoming! I'm out of mana."), "inc! oom.");
        assert_eq!(abbreviate("Can someone resurrect me"), "Can someone rez me");
        assert_eq!(abbreviate("We are looking for more DPS"), "LFM DPS");
    }

    #[test]
    fn leaves_other_text_alone() {
        assert_eq!(abbreviate("I was looking for you"), "I was looking for you");
        assert_eq!(abbreviate("to be, honest"), "to be, honest");
        assert_eq!(abbreviate("Hello there"), "Hello there");
        assert_eq!(abbreviate("I\u{2019}m not gonna lie"), "ngl");
    }

    #[test]
    fn removes_commas_but_not_in_numbers() {
        assert_eq!(
            remove_commas("Well, yeah, it costs 1,000 gold, ok"),
            "Well yeah it costs 1,000 gold ok"
        );
        assert_eq!(remove_commas("hi ,there"), "hi there");
        assert_eq!(remove_commas("no commas"), "no commas");
    }
}
