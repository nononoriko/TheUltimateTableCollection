#[allow(non_snake_case)]
#[allow(dead_code)]
#[allow(private_interfaces)]
pub mod Ext {
    use std::fmt;
    use std::cmp;

    struct Typing;
    impl Typing {
        fn Zip<T: Clone>(data: &[Vec<T>]) -> Vec<Vec<T>> {
            if data.is_empty() {
                return vec![];
            }
            return (0..data[0].len()).map(|i: usize| data.iter().map(|row: &Vec<T>| row[i].clone()).collect()).collect();
        }

        fn Clamp<T: Ord>(number: T, min: T, max: T) -> T {
            return cmp::min(cmp::max(number, min), max);
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
        pub fn Table(row: usize, column: usize) -> Result<Table, ExtError> {
            if row < 1 && column < 1 {
                return Err(ExtError::ValueError("Cannot create a table with 0 cells.".into()));
            }
            else if column == 0 {
                return Err(ExtError::ValueError("Cannot create a table with 0 columns.".into()));
            }
            else if row == 0 {
                return Err(ExtError::ValueError("Cannot create a table with 0 rows.".into()));
            }
    
            let TableVec: Vec<Vec<String>> = vec![vec![String::new(); column]; row];
    
            return Ok(Self { TableVec });
        }
        
        ///Parse a 2D Vec into a Table.
        pub fn Parse(table: Vec<Vec<String>>) -> Result<Table, ExtError> {
            if table.is_empty() {
                return Err(ExtError::ValueError("Cannot create a table with 0 rows.".into()));
            }
    
            let NumberOfColumn: usize = table[0].len();
            if NumberOfColumn == 0 {
                return Err(ExtError::ValueError("Cannot create a table with 0 columns.".into()));
            }

            for i in 0..table.len() {
                if table[i].len() != NumberOfColumn {
                    return Err(ExtError::ValueError(std::format!("Row {} has {} column, expected {}.", i, table[i].len(), NumberOfColumn)));
                }
            }
    
            return Ok(Self { TableVec: table });
        }

        ///Add rows.
        pub fn AddRow(&mut self, index: usize, count: u32) -> Result<(), ExtError> {
            if count < 1 {
                return Err(ExtError::ValueError("count must be more than 0.".into()));
            }
            
            for _ in 0..count {
                self.TableVec.insert(Typing::Clamp(index, 0, self.GetLength()), vec!["".into(); self.GetWidth()]);
            }
            return Ok(());
        }

        ///Add columns.
        pub fn AddColumn(&mut self, index: usize, count: u32) -> Result<(), ExtError> {
            if count < 1 {
                return Err(ExtError::ValueError("count must be more than 0.".into()));
            }
            
            for Row in 0..self.GetWidth() {
                for _ in 0..count {
                    self.TableVec[Row].insert(index, "".into());
                }
            }

            return Ok(());
        }

        ///Set a cell's value.
        pub fn Set(&mut self, value: String, row: usize, column: usize) {
            self.TableVec[row][column] = value;
        }

        ///Remove the row at index.
        pub fn DeleteRow(&mut self, index: usize) -> Result<(), ExtError> {
            if self.GetLength() == 1 {
                return Err(ExtError::ValueError("Cannot remove the last row of the table.".into()));
            }

            self.TableVec.remove(index);
            return Ok(());
        }

        ///Remove the coulumn at index.
        pub fn DeleteColumn(&mut self, index: usize) -> Result<(), ExtError> {
            if self.GetWidth() == 1 {
                return Err(ExtError::ValueError("Cannot remove the last column of the table.".into()));
            }

            for i in 0..self.GetLength() {
                self.TableVec[i].remove(index);
            }
            return Ok(());
        }

        ///Get the content of a cell at row and column.
        pub fn Get(&self, row: usize, column: usize) -> String {
            return self.TableVec[row][column].clone();
        }

        ///Get the amount of rows in the table.
        pub fn GetLength(&self) -> usize {
            return self.TableVec.len();
        }

        ///Get the amount of columns in the table.
        pub fn GetWidth(&self) -> usize {
            return Typing::Zip(&self.TableVec).len();
        }

        pub fn GetRow(&self, index: usize) -> Vec<String> {
            return self.TableVec[index].clone();
        }

        pub fn GetColumn(&self, index: usize) -> Vec<String> {
            return Typing::Zip(&self.TableVec)[index].clone();
        }

        ///Parse the table into a spreadsheet.
        pub fn Stringify(&self, alignment: String) -> Result<String, ExtError> {
            let AllowedType: Vec<String> = vec!["Left".into(), "L".into(), "Right".into(), "R".into(), "Center".into(), "C".into()];
            if !AllowedType.contains(&alignment) {
                return Err(ExtError::ValueError(std::format!("Unknow alignment: {}.", alignment)));
            }

            let LongestPerColumn: Vec<usize> = Typing::Zip(&self.TableVec)
                .iter()
                .map(|Column: &Vec<String>| Column.iter().map(|Cell: &String| Cell.len()).max().unwrap_or(0))
                .collect();
            
            let mut Output: Vec<String> = vec![std::format!("┌{}┐", LongestPerColumn.iter().map(|Width| "─".repeat(Width + 2)).collect::<Vec<String>>().join("┬"))];

            for Row in 0..self.GetLength() {
                let Seperator: String = if Row == self.GetLength() - 1 { 
                    std::format!("└{}┘", LongestPerColumn.iter().map(|Width| "─".repeat(Width + 2)).collect::<Vec<String>>().join("┴")) 
                } 
                else {
                     std::format!("├{}┤", LongestPerColumn.iter().map(|Width| "─".repeat(Width + 2)).collect::<Vec<String>>().join("┼")) 
                };
                let CellStrings: Vec<String> = 
                    self.TableVec[Row].iter().enumerate().map(|(Column, Cell)| {
                        let Width: usize = LongestPerColumn[Column];
                        return match alignment.chars().next().unwrap().to_ascii_uppercase() {
                            'R' => std::format!("{: >Width$}", Cell),
                            'L' => std::format!("{: <Width$}", Cell),
                            _ => std::format!("{: ^Width$}", Cell)
                        };
                    })
                    .collect();
                let RowString: String = std::format!("│ {} │", CellStrings.join(" │ "));
                Output.push(RowString);
                Output.push(Seperator);
            }
            return Ok(Output.join("\n"));
        }

        pub fn CSVify(&self) -> String {
            return self.TableVec.iter().map(|Row: &Vec<String>| Row.join(",")).collect::<Vec<String>>().join("\n");
        }
    }
}