#[allow(non_snake_case)]
#[allow(dead_code)]
#[allow(private_interfaces)]
pub mod Ext {
    use std::fmt;

    struct Typing;
    impl Typing {
        fn Zip<T: Clone>(data: &[Vec<T>]) -> Vec<Vec<T>> {
            if data.is_empty() {
                return vec![];
            }
            return (0..data[0].len()).map(|i| data.iter().map(|row| row[i].clone()).collect()).collect();
        }
    }

    #[derive(Debug)]
    pub enum ExtError {
        ValueError(String),
        IndexError(String)
    }
    
    impl fmt::Display for ExtError {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            match self {
                ExtError::ValueError(msg) => write!(f, "ValueError: {}", msg),
                ExtError::IndexError(msg) => write!(f, "IndexError: {}", msg)
            }
        }
    }
    
    pub struct Table {
        TableVec: Vec<Vec<String>>
    }
    
    impl Table {
        /// Constructs a 1x1 table.
        pub fn Table(mut row: usize, mut column: usize) -> Result<Table, ExtError> {
            if row < 1 && column < 1 {
                return Err(ExtError::ValueError("Cannot create a table with 0 cells.".into()));
            }
            
            if row > 0 && column == 0 {
                column = 1;
            }
            else if row == 0 && column > 0 {
                row = 1;
            }
    
            let TableVec: Vec<Vec<String>> = vec![vec![String::new(); column]; row];
    
            return Ok(Self { TableVec });
        }
        
        ///Parse a 2D Vec into a Table.
        pub fn Parse(table: Vec<Vec<String>>) -> Result<Table, ExtError> {
            if table.is_empty() {
                return Table::Table(1, 1);
            }
    
            let NumberOfColumn: usize = table[0].len();
            for i in 0..table.len() {
                if table[i].len() != NumberOfColumn {
                    return Err(ExtError::ValueError(std::format!("Row {} has {} column, expected {}.", i, table[i].len(), NumberOfColumn)));
                }
            }
    
            return Ok(Self { TableVec: table });
        }
        
        ///Add rows/columns. Top and Bottom add rows, Left and Right add columns.
        pub fn Add(&mut self, where_: String, count: u32) -> Result<(), ExtError> {
            if count < 1 {
                return Err(ExtError::ValueError("count must be greater than 0.".into()));
            }
            
            for _ in 0..count {
                match where_.as_str() {
                    "T" | "Top" => self.TableVec.insert(0,vec!["".into(); self.TableVec[0].len()]),
                    "B" | "Bottom" => self.TableVec.push(vec!["".into(); self.TableVec[0].len()]),
                    "R" | "Right" => {
                        for Row in 0..self.TableVec.len() {
                            self.TableVec[Row].push("".into());
                        }
                    },
                    "L" | "Left" => {
                        for Row in 0..self.TableVec.len() {
                            self.TableVec[Row].insert(0, "".into());   
                        }
                    },
                    _ => return Err(ExtError::ValueError(std::format!("Unknown direction: {}.", where_)))
                }
            }
    
            return Ok(());
        }

        ///Set a cell's value.
        pub fn Set(&mut self, value: String, row: usize, column: usize) -> Result<(), ExtError> {
            if row >= self.TableVec.len() || column >= self.TableVec[0].len() {
                return Err(ExtError::IndexError("Table index out of range.".into()));
            }

            self.TableVec[row][column] = value;
            return Ok(());
        }

        ///Delete a row/column.
        pub fn Delete(&mut self, type_: String, index: usize) -> Result<(), ExtError> {
            let AllowedType: Vec<String> = vec!["Row".into(), "R".into(), "Column".into(), "C".into()];
            if !AllowedType.contains(&type_) {
                return Err(ExtError::ValueError(std::format!("Unknow type: {}", type_)));
            }

            if self.TableVec.len() == 1 && type_.starts_with("R") || self.TableVec[0].len() == 1 && type_.starts_with("C") {
                return Err(ExtError::ValueError("Cannot remove the last row/column of the table.".into()));
            }

            if type_.starts_with("R") && index >= self.TableVec.len() || type_.starts_with("C") && index >= self.TableVec[0].len() {
                return Err(ExtError::IndexError("Table index out of range.".into()));
            }

            if type_.starts_with("R") {
                self.TableVec.remove(index);
                return Ok(());
            }

            for i in 0..self.TableVec.len() {
                self.TableVec[i].remove(index);
            }
            return Ok(());
        }

        ///Get the content of a row/column in a Vec.
        pub fn GetLine(&self, type_: String, index: usize) -> Result<Vec<String>, ExtError> {
            let AllowedType: Vec<String> = vec!["Row".into(), "R".into(), "Column".into(), "C".into()];
            if !AllowedType.contains(&type_) {
                return Err(ExtError::ValueError(std::format!("Unknow type: {}.", type_)));
            }

            if type_.starts_with("R") && index >= self.TableVec.len() || type_.starts_with("C") && index >= self.TableVec[0].len() {
                return Err(ExtError::IndexError("Table index out of range.".into()));
            }
            
            return match type_.as_str() {
                "Row" | "R" => Ok(self.TableVec[index].clone()),
                _ => {
                    let Zipped: Vec<Vec<String>> = Typing::Zip(&self.TableVec);
                    return Ok(Zipped[index].clone());
                }
            };
        }

        ///Get the content of a cell at row and column.
        pub fn Get(&self, row: usize, column: usize) -> Result<String, ExtError> {
            if row >= self.TableVec.len() || column >= self.TableVec[0].len() {
                return Err(ExtError::IndexError("Table index out of range.".into()));
            }

            return Ok(self.TableVec[row][column].clone());
        }

        ///Parse the table into a spreadsheet.
        pub fn Stringify(&self, alignment: String) -> Result<String, ExtError> {
            let AllowedType: Vec<String> = vec!["Left".into(), "L".into(), "Right".into(), "R".into(), "Center".into(), "C".into()];
            if !AllowedType.contains(&alignment) {
                return Err(ExtError::ValueError(std::format!("Unknow alignment: {}.", alignment)));
            }
            let LongestPerColumn: Vec<usize> = 
                Typing::Zip(&self.TableVec)
                .iter()
                .map(|Column: &Vec<String>| Column.iter().map(|Cell: &String| Cell.len()).max().unwrap_or(0))
                .collect();
            let Seperator: String = std::format!("+{}+", 
                LongestPerColumn
                .iter()
                .map(|Width| "-".repeat(Width + 2))
                .collect::<Vec<String>>().join("+")
            );
            let mut Output: Vec<String> = vec![Seperator.clone()];

            for Row in 0..self.TableVec.len() {
                let CellStrings: Vec<String> = 
                    self.TableVec[Row].iter().enumerate().map(|(Column, Cell)| {
                        let Width: usize = LongestPerColumn[Column];
                        match alignment.chars().next().unwrap().to_ascii_uppercase() {
                            'R' => std::format!("{: >Width$}", Cell),
                            'L' => std::format!("{: <Width$}", Cell),
                            _ => std::format!("{: ^Width$}", Cell)
                        }
                    })
                    .collect();
                let RowString: String = std::format!("| {} |", CellStrings.join(" | "));
                Output.push(RowString);
                Output.push(Seperator.clone());
            }
            return Ok(Output.join("\n"));
        }
    }
}