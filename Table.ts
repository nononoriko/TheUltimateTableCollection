class ValueError extends Error {
    constructor(Message: string) {
        super(Message);
        this.name = "ValueError";
    }
}

class IndexError extends Error {
    constructor(Message: string) {
        super(Message);
        this.name = "IndexError";
    }
}

export default class Table {
    private Table: string[][] = [];

    public constructor(row: number = 1, column: number = 1) {
        if(row <= 0 && column <= 0)
            throw new ValueError("Cannot create a table with 0 cells.");
        else if(column <= 0) 
            throw new ValueError("Cannot create a table with 0 columns.");
        else if(row <= 0) 
            throw new ValueError("Cannot create a table with 0 rows.");

        this.Table = new Array(row).fill(new Array(column).fill(""));
    }

    public static Parse = (table: string[][]): Table => {
        if(table.length === 0)
            throw new ValueError("Cannot create a table with 0 rows.");

        const NumberOfColumns: number = table[0].length;
        if(NumberOfColumns === 0) {
            throw new ValueError("Cannot create a table with 0 columns.");
        }
        
        for(const [i, Row] of table.entries()) {
            if(Row.length !== NumberOfColumns) {
                throw new ValueError(`Row ${i} has ${Row.length} columns, expected ${NumberOfColumns}.`);
            }
        }

        const New: Table = new Table();
        New.Table = table;
        return New;
    };

    public AddRow = (index: number = this.GetLength() - 1, count: number = 1) => {
        if(count < 1)
            throw new ValueError("count must be greater than 0.");

        for(let _ = 0; _ < count; ++_)
            this.Table.splice(Table.Clamp(index, this.GetLength() - 1), 0, Array(this.GetWidth()).fill(""));
    };

    public AddColumn = (index: number = this.GetWidth() - 1, count: number = 1) => {
        if(count < 1)
            throw new ValueError("count must be greater than 0.");

        for(let _ = 0; _ < count; ++_) {
            for(const Row of this.Table) {
                Row.splice(Table.Clamp(index, this.GetWidth() - 1), 0, "")
            }
        }
    };

    public Set = (value: string, row: number, column: number) => this.Table[row][column] = value;

    public DeleteRow = (index: number) => {
        if(this.GetLength() === 1)
            throw new ValueError("Cannot remove the last row of the table.");

        this.Table.splice(index, 1);
    }

    public DeleteColumn = (index: number) => {
        if(this.GetWidth() === 1)
            throw new ValueError("Cannot remove the last column of the table.");

        for(let i = 0; i < this.GetLength(); ++i)
            this.Table[i].splice(index, 1);
    }

    public GetLength = (): number => this.Table.length;
    
    public GetWidth = (): number => Table.Zip(this.Table).length;

    public GetRow = (index: number): string[] => structuredClone(this.Table[index]);


    public GetComlumn = (index: number): string[] => Table.Zip(this.Table)[index];

    public Get = (row: number, column: number): string => this.Table[row][column];

    public Stringify = (alignment: "Left" | "Right" | "Center" | "L" | "R" | "C" = "L"): string => {
        const LongestPerColumn: number[] = Table.Zip(...this.Table).map(Column => Math.max(...Column.map(Cell => Cell.length)));

        const FirstSeparator: string = `┌${LongestPerColumn.map(Width => "─".repeat(Width + 2)).join("┬")}┐`;
        const Separator: string = `├${LongestPerColumn.map(Width => "─".repeat(Width + 2)).join("┼")}┤`;
        const LastSeparator: string = `└${LongestPerColumn.map(Width => "─".repeat(Width + 2)).join("┴")}┘`;

        const Output: string[] = [FirstSeparator];

        for(const [Index, Row] of this.Table.entries()) {
            const CellStrings: string[] = [...Row.entries()].map(([Column, Cell]) => 
                alignment.startsWith("R") ? Cell.padStart(LongestPerColumn[Column]) : 
                alignment.startsWith("L") ? Cell.padEnd(LongestPerColumn[Column]) : 
                Table.Center(Cell, LongestPerColumn[Column])
            );

            const RowString: string = `│ ${CellStrings.join(" │ ")} │`;
            Output.push(RowString);

            Index == this.GetLength() ? Output.push(LastSeparator) : Output.push(Separator);
        }
        return Output.join("\n");
    };
    
    public CSVify = (): string => this.Table.map(Row => Row.join(",")).join("\n");

    private static Center = (string: string, width: number, pad: string = " ") => {
        if(string.length >= width)
            return string;

        const TotalPadding = width - string.length;
        const Left = Math.floor(TotalPadding / 2.0);
        const Right = TotalPadding - Left;
        return `${pad.repeat(Left)}${string}${pad.repeat(Right)}`;
    };

    private static Zip = (...Iterators: any[]) => {
        const length = Math.min(...Iterators.map(It => It.length));
        return Array.from({ length }, (_, i) => Iterators.map(It => It[i]));
    };

    private static Clamp = (number: number, min: number, max?: number) => {
        if(typeof number !== "number")
            throw new TypeError("Param number must be a number.");

        if(typeof min !== "number")
            throw new TypeError("Param min must be a number.");

        if(typeof max !== "number" || max === null)
            throw new TypeError("Param max must be a number or null.");

        if(!max)
            [min, max] = [0, min];

        return Math.min(Math.max(number, min), max);
    };
}