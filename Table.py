from typing import Literal, Self
from copy import deepcopy

class Table:
    Table: list[list[str]] = []

    def __init__(self, row: int = 1, column: int = 1) -> None:
        """
        Create a table.
        """
        if not isinstance(row, int):
            raise TypeError("Param row must be an int.")
        
        if not isinstance(column, int):
            raise TypeError("Param column must be an int.")
        
        if row <= 0 and column <= 0:
            raise ValueError("Cannot create a table with 0 cells.")
        elif column <= 0:
            raise ValueError("Cannot create a table with 0 columns.")
        elif row <= 0:
            raise ValueError("Cannot create a table with 0 rows.")

        self.Table = [[""] * row] * column
    
    @classmethod
    def Parse(cls, table: list[list[str]]) -> Self:
        """
        Parse a 2D list into a Table object.

        Pass in True for the cast param in order to enable automatic casting. Note: Custom classes must implement the __str__() method.
        """
        if not isinstance(table, list):
            raise TypeError("Param table must be a list.")
        
        if not all(isinstance(Row, list) for Row in table):
            raise TypeError("Every row in 'table' must be a list.")
        
        if len(table) == 0:
            raise ValueError("Cannot create a table with 0 rows.")

        NumberOfColumns: int = len(table[0])
        if NumberOfColumns == 0:
            raise ValueError("Cannot create a table with 0 columns.")

        for i, Row in enumerate(table):
            if len(Row) != NumberOfColumns:
                raise ValueError(f"Row {i} has {len(Row)} columns, expected {NumberOfColumns}.")

        for i, Row in enumerate(table):
            for j, Cell in enumerate(Row):
                if not isinstance(Cell, str):
                    raise TypeError(f"Cell ({i}, {j}) must be a str, got {type(Cell).__name__}.")

        New: Table = Table()
        New.Table = table
        return New
    
    def AddRow(self, index: int = -1, count: int = 1) -> None:
        """
        Add a row at index. Note: If index is greater than GetLength() - 1 then this function will append the rows instead.
        """
        if not isinstance(count, int):
            raise TypeError("Param count must be an int.")
        
        if not isinstance(index, int):
            raise TypeError("Param index must be an int.")
        
        if count < 1:
            raise ValueError("count must be more than 0.")
        
        for _ in range(count):
            self.Table.insert(index, [""] * self.GetWidth())

    def AddColumn(self, index: int = -1, count: int = 1) -> None:
        """
        Add a column at index. Note: If index is greater than GetWidth() - 1 then this function will append the columns instead.
        """
        if not isinstance(count, int):
            raise TypeError("Param count must be an int.")
        
        if not isinstance(index, int):
            raise TypeError("Param index must be an int.")
        
        if count < 1:
            raise ValueError("count must be more than 0.")
        
        for _ in range(count):
            for Row in self.Table:
                Row.insert(index, "")
            
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
        
        self.Table[row][column] = value

    def DeleteRow(self, index: int) -> None:
        """
        Delete the row at index.
        """
        if not isinstance(index, int):
            raise TypeError("Param index must be an int.")
        
        if self.GetLength() == 1:
            raise ValueError(f"Cannot remove the last row of the table.")
        
        self.Table.pop(index)
        
    def DeleteColumn(self, index: int) -> None:
        """
        Delete the column at index.
        """
        if not isinstance(index, int):
            raise TypeError("Param index must be an int.")
                
        if self.GetWidth() == 1:
            raise ValueError("Cannot remove the last column of the table.")
        
        for i in range(self.GetLength()):
            self.Table[i].pop(index)

    def GetLength(self) -> int:
        """
        Get the amount of rows in the table.
        """
        return len(self.Table)

    def GetWidth(self) -> int:
        """
        Get the aoumt of columns in the table.
        """
        return len(zip(self.Table))
        
    def GetRow(self, index: int) -> list[str]:
        """
        Get the row at index.
        """
        if not isinstance(index, int):
            raise TypeError("Param index must be an int.")
        
        return deepcopy(self.Table[index])
    
    def GetColumn(self, index: int) -> list[str]:
        """
        Get the column at index.
        """
        if not isinstance(index, int):
            raise TypeError("Param index must be an int.")
        
        return list(list(zip(*self.Table))[index])

    def Get(self, row: int, column: int) -> str:
        """
        Get the value of the cell at row and column. This uses 0-based indexing.
        """
        if not isinstance(row, int):
            raise TypeError("Param row must be an int.")
        
        if not isinstance(column, int):
            raise TypeError("Param column must be an int.")
        
        return self.Table[row][column]

    def Stringify(self, alignment: Literal["Left", "Right", "Center", "L", "R", "C"] = "L") -> str:
        """
        Turn the table into a spreadsheet string.
        """
        if alignment not in ["Left", "Right", "Center", "L", "R", "C"]:
            raise ValueError(f"Unknown alignment: {alignment}.")
        
        LongestPerColumn: list[int] = [max(len(Cell) for Cell in Column) for Column in zip(*self.Table)]
        FirstSeperator: str = f"┌{'┬'.join("─" * (Width + 2) for Width in LongestPerColumn)}┐"
        Seperator: str = f"├{'┼'.join("─" * (Width + 2) for Width in LongestPerColumn)}┤"
        LastSeperator: str = f"└{'┴'.join("─" * (Width + 2) for Width in LongestPerColumn)}┘"
        Output: list[str] = [FirstSeperator]

        for Index, Row in enumerate(self.Table):
            CellStrings: list[str] = [
                Cell.rjust(LongestPerColumn[Column]) if alignment.startswith("R")
                else Cell.ljust(LongestPerColumn[Column]) if alignment.startswith("L")
                else Cell.center(LongestPerColumn[Column])
                for Column, Cell in enumerate(Row)
            ]
            RowString: str = f"│ {' │ '.join(CellStrings)} │"
            Output.append(RowString)

            Output.append(LastSeperator) if Index == self.GetLength() - 1 else Output.append(Seperator)

        return "\n".join(Output)
    
    def CSVify(self) -> str:
        """
        Turn the table into a CSV string.
        """
        return "\n".join(",".join(Row) for Row in self.Table)

    def __str__(self) -> str:
        return self.Stringify()