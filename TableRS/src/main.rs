#![allow(non_snake_case)]
#![allow(unused_must_use)]
mod Ext;
use Ext::Ext::Table;
use std::{fs::File, fs::OpenOptions, io::Read, io::Write};

fn CSVParse(CSVString: String) -> Vec<Vec<String>> {
    return CSVString.split("\n").map(|Row: &str| Row.trim().split(",").map(|Cell: &str| Cell.to_string()).collect()).collect();
}

fn main() -> Result<(), std::io::Error> {
    let mut file = File::open("./poemwords.csv")?;
    let mut outfile = OpenOptions::new().write(true).create(true).open("output.txt")?;
    let mut contents = String::new();
    
    file.read_to_string(&mut contents);
    let table = Table::Parse(CSVParse(contents)).unwrap();
    write!(outfile, "{}", table.Stringify("L".into()).unwrap());
    
    return Ok(());
}