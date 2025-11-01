from typing import Literal, Self
import csv

class Table:
    Table: list[list[str]] = []

    def __init__(self, row: int = 0, column: int = 0) -> None:
        """
        Create a table.
        """
        if not isinstance(row, int):
            raise TypeError("Param row must be an int.")
        
        if not isinstance(column, int):
            raise TypeError("Param column must be an int.")
        
        if row <= 0 and column <= 0:
            return
        
        if row > 0 and column <= 0:
            column = 1
        elif row <= 0 and column > 0:
            row = 1

        while len(self.Table) < row:
            self.Table.append([])
        
        for i in range(len(self.Table)):
            while len(self.Table[i]) < column:
                self.Table[i].append("")
    
    @staticmethod
    def Parse(table: list[list[str]], cast: bool = False) -> Self:
        """
        Parse an existing 2D list into a Table object.

        Pass in True for the cast param in order to enable automatic casting. Note: Custom classes must implement the __str__() method.
        """
        if not isinstance(table, list):
            raise TypeError("Param table must be a list.")
        
        if not all(isinstance(Row, list) for Row in table):
            raise TypeError("Every row in 'table' must be a list.")
        
        if len(table) == 0:
            return Table()

        NumberOfColumns: int = len(table[0])
        for i, Row in enumerate(table):
            if len(Row) != NumberOfColumns:
                raise ValueError(f"Row {i} has {len(Row)} columns, expected {NumberOfColumns}.")

        ProcessedTable: list[list[str]] = []
        for i, Row in enumerate(table):
            NewRow: list[str] = []
            for j, Cell in enumerate(Row):
                if not isinstance(Cell, str):
                    if cast:
                        NewRow.append(str(Cell))
                    else:
                        raise TypeError(f"Cell ({i}, {j}) must be a str, got {type(Cell).__name__}.")
                else:
                    NewRow.append(Cell)
            ProcessedTable.append(NewRow)

        New: Table = Table()
        New.Table = ProcessedTable
        return New

    def Add(self, where: Literal["Top", "Bottom", "Left", "Right", "T", "L", "B", "R"], count: int = 1) -> None:
        """
        Add a row/column to the table. Pass "Top" and "Bottom" to where to add rows, pass "Left" and "Right" to where to add column.
        """
        if not isinstance(count, int):
            raise TypeError("Param count must be an int.")
        
        if count < 1:
            raise ValueError("count must be more than 0.")
        
        for _ in range(count):
            match where:
                case "Top" | "T":
                    self.Table.insert(0, [""] * len(self.Table[0]))
                case "Bottom" | "B":
                    self.Table.append([""] * len(self.Table[0]))
                case "Left" | "L":
                    for i in range(len(self.Table)):
                        self.Table[i].append("")
                case "Right" | "R":
                    for i in range(len(self.Table)):
                        self.Table[i].insert(0, "")
                case _:
                    raise ValueError(f"Unknown direction: {where}.")
            
    def Set(self, value: str, row: int, column: int) -> None:
        """
        Set the value of the cell at row and column. This uses 0-based indexing.
        """
        if not isinstance(value, str):
            raise TypeError("Param value must be a str.")
        
        if not isinstance(row, int):
            raise TypeError("Param row must be an int.")
        
        if not isinstance(column, int):
            raise TypeError("Param column must be an int.")
        
        if row > len(self.Table) - 1:
            raise IndexError("Table row index out of range.")
        
        if column > len(self.Table[row]) - 1:
            raise IndexError("Table column index out of range.")

        self.Table[row][column] = value

    def Delete(self, type: Literal["Row", "Column", "R", "C"], index: int) -> None:
        """
        Delete a row/column at index. This uses 0-based indexing.
        """
        if type not in ["Row", "Column", "R", "C"]:
            raise ValueError(f"Unknown type: {type}.")
        
        if isinstance(index, int):
            raise TypeError("Param index must be an int.")
        
        if type.startswith("R") and index > len(self.Table) - 1:
            raise IndexError("Table row index out of range.")
        
        if type.startswith("C") and index > len(self.Table[0]) - 1:
            raise IndexError("Table column index out of range.")
        
        match type:
            case "Column" | "C":
                for i in range(len(self.Table)):
                    self.Table[i].pop(index)
            case "Row" | "R":
                self.Table.pop(index)

    def Get(self, row: int, column: int) -> str:
        """
        Get the value of the cell at row and column. This uses 0-based indexing.
        """
        if not isinstance(row, int):
            raise TypeError("Param row must be an int.")
        
        if not isinstance(column, int):
            raise TypeError("Param column must be an int.")
        
        if row > len(self.Table) - 1:
            raise IndexError("Row index out of range.")
        
        if column > len(self.Table[row]) - 1:
            raise IndexError("Column index out of range.")
        
        return self.Table[row][column]

    def Stringify(self, alignment: Literal["Left", "Right", "Center", "L", "R", "C"]) -> str:
        if alignment not in ["Left", "Right", "Center", "L", "R", "C"]:
            raise ValueError(f"Unknown alignment: {alignment}.")
        
        LongestPerColumn: list[int] = [max(len(Cell) for Cell in Column) for Column in zip(*self.Table)]
        Seperator: str = "+" + "+".join("-" * (Width + 2) for Width in LongestPerColumn) + "+"
        Output: list[str] = [Seperator]

        for Row in range(len(self.Table)):
            CellStrings: list[str] = [
                Cell.rjust(LongestPerColumn[Column]) if alignment.startswith("R")
                else Cell.ljust(LongestPerColumn[Column]) if alignment.startswith("L")
                else Cell.center(LongestPerColumn[Column])
                for Column, Cell in enumerate(self.Table[Row])
            ]
            RowString: str = "| " + " | ".join(CellStrings) + " |"
            Output.append(RowString)
            Output.append(Seperator)

        return "\n".join(Output)

    def __str__(self) -> str:
        return self.Stringify("L")
    
with open("poemwords.csv") as file:
    CSV: list[list[str]] = list(csv.reader(file))

table: Table = Table.Parse(CSV)

with open("output.txt", "w", encoding="utf-8") as file:
    file.write(table.Stringify("L"))