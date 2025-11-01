import fs from "fs/promises";

/**
 * 
 * @param {string} csvString
 * @returns {string[][]} 
 */
const CSVParse = (csvString) => {
    const Lines = csvString.split("\n");
    return Lines.map(Line => Line.trim().split(","));
};

class ValueError extends Error {
    constructor(Message) {
        super(Message);
        this.name = "ValueError";
    }
}

class IndexError extends Error {
    constructor(Message) {
        super(Message);
        this.name = "IndexError";
    }
}

class Table {
    /**
     * @type {string[][]}
     */
    Table = [];

    /**
     * @param {number} row 
     * @param {number} column 
     */
    constructor(row = 0, column = 0) {
        if(Table.GetType(row) !== "int") 
            throw new TypeError("Param row must be an int.");
        
        if(Table.GetType(column) !== "int")
            throw new TypeError("Param column must be an int.");

        if(row <= 0 && column <= 0)
            return;

        if(row > 0 && column <= 0) 
            column = 1;
        else if(row <= 0 && column > 0) 
            row = 1;

        while(this.Table.length < row) 
            this.Table.push([]);

        for(let i = 0; i < this.Table.length; ++i) {
            while(this.Table[i].length < column) {
                this.Table[i].push("");
            }
        }
    }

    /**
     * 
     * @param {string[][]} table 
     * @param {boolean} cast 
     * @returns {Table}
     */
    static Parse = (table, cast = false) => {
        if(Table.GetType(table) !== "array")
            throw new TypeError("Param table must be an array.");

        if(table.every(Row => Table.GetType(Row) !== "array")) 
            throw new TypeError("Every row in 'table' must be an array.");

        if(table.length === 0)
            return new Table();

        /**
         * @type {number}
         */
        const NumberOfColumns = table[0].length;
        for(const [i, Row] of table.entries()) {
            if(Row.length !== NumberOfColumns) {
                throw new ValueError(`Row ${i} has ${Row.length} columns, expected ${NumberOfColumns}.`);
            }
        }

        /**
         * @type {string[][]}
         */
        const ProcessedTable = [];
        for(const [i, Row] of table.entries()) {
            /**
             * @type {string[]}
             */
            const NewRow = [];
            for(const [j, Cell] of Row.entries()) {
                if(Table.GetType(Cell) !== "string") {
                    if(cast) {
                        NewRow.push(String(Cell));
                    }
                    else {
                        throw new TypeError(`Cell (${i}, ${j}) must be a string.`);
                    }
                }
                else {
                    NewRow.push(Cell);
                }
            }
            ProcessedTable.push(NewRow);
        }

        /**
         * @type {Table}
         */
        const New = new Table();
        New.Table = ProcessedTable;
        return New;
    };

    /**
     * 
     * @param {"Top" | "Bottom" | "Left" | "Right" | "T" | "L" | "B" | "R"} where 
     * @param {number} count 
     */
    Add = (where, count = 1) => {
        if(Table.GetType(count) !== "int")
            throw new TypeError("Param count must be an int.");
        
        if(count < 1)
            throw new ValueError("count must be greater than 0.");

        for(let _ = 0; _ < count; ++_) {
            switch(where) {
                case "Top":
                case "T":
                    this.Table.splice(0, 0, Array(this.Table[0].length).fill(""));
                    break;

                case "Bottom":
                case "B":
                    this.Table.push(Array(this.Table[0].length).fill(""));
                    break;

                case "Left":
                case "L":
                    for(let i = 0; i < this.Table.length; ++i) {
                        this.Table[i].splice(0, 0, "");
                    }
                    break;

                case "Right":
                case "R":
                    for(let i = 0; i < this.Table.length; ++i) {
                        this.Table[i].push("");
                    }
                    break;

                default:
                    throw new ValueError(`Unknown direction: ${where}.`);
            }
        }
    };

    /**
     * 
     * @param {string} value 
     * @param {number} row 
     * @param {number} column 
     */
    Set = (value, row, column) => {
        if(Table.GetType(value) !== "string") 
            throw new TypeError("Param value must be a string.");

        if(Table.GetType(row) !== "int") 
            throw new TypeError("Param row must be an int.");

        if(Table.GetType(column) !== "int") 
            throw new TypeError("Param column must be an int.");

        if(row > this.Table.length - 1 || row < 0)
            throw new IndexError("Table row index out of range.");

        if(column > this.Table[row].length || column < 0)
            throw new IndexError("Table column index out of range.");

        this.Table[row][column] = value;
    };

    /**
     * 
     * @param {"Row" | "Column" | "R" | "C"} type 
     * @param {number} index 
     */
    Delete = (type, index) => {
        if(!["Row", "Column", "R", "C"].includes(type)) 
            throw new ValueError(`Unknown type: ${type}.`);

        if(Table.GetType(index) !== "int")
            throw new TypeError("Param index has to be an int.");

        if(type.startsWith("R") && index > this.Table.length - 1)
            throw new IndexError("Table row index out of range.");

        if(type.startsWith("C") && index > this.Table[0].length - 1)
            throw new IndexError("Table column index out of range.");

        switch(type) {
            case "Row":
            case "R":
                this.Table.splice(index, 1);
                break;

            case "Column":
            case "C":
                for(let i = 0; i < this.Table.length; ++i)
                    this.Table[i].splice(index, 1);
                break;
        }
    };

    /**
     * 
     * @param {number} row 
     * @param {number} column 
     * @returns {string}
     */
    Get = (row, column) => {
        if(Table.GetType(row) !== "int") 
            throw new TypeError("Param row must be an int.");

        if(Table.GetType(column) !== "int") 
            throw new TypeError("Param column must be an int.");

        if(row > this.Table.length - 1 || row < 0)
            throw new IndexError("Table row index out of range.");

        if(column > this.Table[row].length || column < 0)
            throw new IndexError("Table column index out of range.");

        return this.Table[row][column];
    };

    /**
     * 
     * @param {"Left" | "Right" | "Center" | "L" | "R" | "C"} alignment 
     * @returns {string}
     */
    Stringify = (alignment) => {
        if(!["Left", "Right", "Center", "L", "R", "C"].includes(alignment))
            throw new ValueError(`Unknown alignment: ${alignment}.`);

        /**
         * @type {number[]}
         */
        const LongestPerColumn = Table.Zip(...this.Table).map(Column => Math.max(...Column.map(Cell => Cell.length)));
        /**
         * @type {string}
         */
        const Seperator = "+" + LongestPerColumn.map(Width => "-".repeat(Width + 2)).join("+") + "+";
        /**
         * @type {string[]}
         */
        const Output = [Seperator];

        for(let Row = 0; Row < this.Table.length; ++Row) {
            /**
             * @type {string[]}
             */
            const CellStrings = [...this.Table[Row].entries()].map(([Column, Cell]) => 
                alignment.startsWith("R") ? Cell.padStart(LongestPerColumn[Column]) : 
                alignment.startsWith("L") ? Cell.padEnd(LongestPerColumn[Column]) : 
                Table.Center(Cell, LongestPerColumn[Column])
            );
            /**
             * @type {string}
             */
            const RowString = "| " + CellStrings.join(" | ") + " |";
            Output.push(RowString, Seperator);
        }
        return Output.join("\n");
    };

    /**
     * Get the true type of the passed in object.
     * @param {any} object 
     * @returns {string} The true type of the object. null, array, int, float, infinities, and NaN included.
     */
    static GetType = (object) => {
        switch(object) {
            case null:
                return "null";
            case Infinity:
                return "Infinity";
            case -Infinity:
                return "-Infinity";
        }
        
        const Type = typeof object;
        switch(true) {
            case Number.isNaN(object):
                return "NaN";
            case Array.isArray(object):
                return "array";
            case Type === "number":
                if(Number.isInteger(object))
                    return "int";
                else
                    return "float";
            default:
                return Type;
        }
    };

    /**
     * 
     * @param {string} string 
     * @param {number} width 
     * @param {string} pad 
     */
    static Center = (string, width, pad = " ") => {
        if(Table.GetType(string) !== "string")
            throw new TypeError("Param string must be a string.");

        if(Table.GetType(pad) !== "string")
            throw new TypeError("Param pad must be a string.");

        if(Table.GetType(width) !== "int")
            throw new TypeError("Param width must be an int.");

        const TotalPadding = width - string.length;
        const Left = Math.floor(TotalPadding / 2);
        const Right = TotalPadding - Left;
        return pad.repeat(Left) + string + pad.repeat(Right);
    }

    static Zip = (...Iterators) => {
        const length = Math.min(...Iterators.map(It => It.length));
        return Array.from({ length }, (_, i) => Iterators.map(It => It[i]));
    };
}

const file = await fs.readFile("poemwords.csv", { encoding: "utf-8" });
const csvTable = Table.Parse(CSVParse(file));
await fs.writeFile("output.txt", csvTable.Stringify("L"), { encoding: "utf-8" });