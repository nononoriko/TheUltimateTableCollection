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

export default class Table {
    /**
     * @type {string[][]}
     */
    #Table = [];

    /**
     * Create a new 1x1 Table.
     * @param {number} row 
     * @param {number} column 
     */
    constructor(row = 1, column = 1) {
        if(Table.#GetType(row) !== "int") 
            throw new TypeError("Param row must be an int.");
        
        if(Table.#GetType(column) !== "int")
            throw new TypeError("Param column must be an int.");

        if(row <= 0 && column <= 0)
            throw new ValueError("Cannot create a table with 0 cells.");
        else if(column <= 0) 
            throw new ValueError("Cannot create a table with 0 columns.");
        else if(row <= 0) 
            throw new ValueError("Cannot create a table with 0 rows.");

        while(this.GetLength() < row) 
            this.#Table.push([]);

        for(let i = 0; i < this.GetLength(); ++i) {
            while(this.#Table[i].length < column) {
                this.#Table[i].push("");
            }
        } 
    }

    /**
     * Parse a 2D array to a table.
     * @param {string[][]} table 
     * @param {boolean} cast 
     * @returns {Table}
     */
    static Parse = (table, cast = false) => {
        if(Table.#GetType(table) !== "array")
            throw new TypeError("Param table must be an array.");

        if(table.every(Row => Table.#GetType(Row) !== "array")) 
            throw new TypeError("Every row in 'table' must be an array.");

        if(table.length === 0)
            throw new ValueError("Cannot create a table with 0 rows.");

        /**
         * @type {number}
         */
        const NumberOfColumns = table[0].length;
        if(NumberOfColumns === 0) {
            throw new ValueError("Cannot create a table with 0 columns.");
        }
        
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
                if(Table.#GetType(Cell) !== "string") {
                    if(cast) 
                        NewRow.push(String(Cell));
                    else throw new TypeError(`Cell (${i}, ${j}) must be a string.`);
                }
                else NewRow.push(Cell);
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
     * Add a row at index. Note: index will be clamp into the range from 0 to GetLength() - 1.
     * @param {number} index 
     * @param {number} count
     */
    AddRow = (index = this.GetLength() - 1, count = 1) => {
        if(Table.#GetType(index) !== "int")
            throw new TypeError("Param count must be an int.");

        if(Table.#GetType(count) !== "int")
            throw new TypeError("Param count must be an int.");
        
        if(count < 1)
            throw new ValueError("count must be greater than 0.");

        for(let _ = 0; _ < count; ++_)
            this.#Table.splice(Table.#Clamp(index, this.GetLength() - 1), 0, Array(this.GetWidth()).fill(""));
    };

    /**
     * Add a column at index. Note: index will be clamp into the range from 0 to GetWidth() - 1.
     * @param {number} index 
     * @param {number} count 
     */
    AddColumn = (index = this.GetWidth() - 1, count = 1) => {
        if(Table.#GetType(index) !== "int")
            throw new TypeError("Param count must be an int.");

        if(Table.#GetType(count) !== "int")
            throw new TypeError("Param count must be an int.");
        
        if(count < 1)
            throw new ValueError("count must be greater than 0.");

        for(let _ = 0; _ < count; ++_) {
            for(const Row of this.#Table) {
                Row.splice(Table.#Clamp(index, this.GetWidth() - 1), 0, "")
            }
        }
    };

    /**
     * Set the value of the cell at row and column.
     * @param {string} value 
     * @param {number} row 
     * @param {number} column 
     */
    Set = (value, row, column) => {
        if(Table.#GetType(value) !== "string") 
            throw new TypeError("Param value must be a string.");

        if(Table.#GetType(row) !== "int") 
            throw new TypeError("Param row must be an int.");

        if(Table.#GetType(column) !== "int") 
            throw new TypeError("Param column must be an int.");

        if(row >= this.GetLength() || row < 0 || column >= this.GetWidth() || column < 0)
            throw new IndexError("Table index out of range.");

        this.#Table[row][column] = value;
    };

    /**
     * Delete the row at index.
     * @param {number} index 
     */
    DeleteRow = (index) => {
        if(Table.#GetType(index) !== "int")
            throw new TypeError("Param index has to be an int.");

        if(index >= this.GetLength() || index < 0)
            throw new IndexError("Table row index out of range.");

        if(this.GetLength() === 1)
            throw new ValueError("Cannot remove the last row of the table.");

        this.#Table.splice(index, 1);
    }

    /**
     * Delete the column at index.
     * @param {number} index 
     */
    DeleteColumn = (index) => {
        if(Table.#GetType(index) !== "int")
            throw new TypeError("Param index has to be an int.");

        if(index >= this.GetWidth() || index < 0)
            throw new IndexError("Table column index out of range.");

        if(this.GetWidth() === 1)
            throw new ValueError("Cannot remove the last column of the table.");

        for(let i = 0; i < this.GetLength(); ++i)
            this.#Table[i].splice(index, 1);
    }

    /**
     * Get the amount of rows in the table.
     * @returns {number}
     */
    GetLength = () => this.GetLength();
    
    /**
     * Get the amount of columns in the table.
     * @returns {number}
     */
    GetWidth = () => Table.#Zip(this.#Table).length;

    /**
     * Get the row at index.
     * @param {number} index 
     * @returns {string[]}
     */
    GetRow = (index) => {
        if(Table.#GetType(index) === "string")
            throw new TypeError("Param index must be an int.");

        if(index >= this.GetLength())
            throw new IndexError("Table row index out of range.");

        return structuredClone(this.#Table[index]);
    };

    /**
     * Get the column at index.
     * @param {number} index 
     * @returns {string[]}
     */
    GetComlumn = (index) => {
        if(Table.#GetType(index) === "string")
            throw new TypeError("Param index must be an int.");

        if(index >= this.GetWidth())
            throw new IndexError("Table column index out of range.");

        return Table.#Zip(this.#Table)[index];
    };

    /**
     * Get the value of the cell at row and column.
     * @param {number} row 
     * @param {number} column 
     * @returns {string}
     */
    Get = (row, column) => {
        if(Table.#GetType(row) !== "int") 
            throw new TypeError("Param row must be an int.");

        if(Table.#GetType(column) !== "int") 
            throw new TypeError("Param column must be an int.");

        if((row >= this.GetLength() || row < 0) || (column >= this.#Table[row].length || column < 0))
            throw new IndexError("Table index out of range.");

        return this.#Table[row][column];
    };

    /**
     * Parse the table into a spreadsheet.
     * @param {"Left" | "Right" | "Center" | "L" | "R" | "C"} alignment 
     * @returns {string}
     */
    Stringify = (alignment = "L") => {
        if(!["Left", "Right", "Center", "L", "R", "C"].includes(alignment))
            throw new ValueError(`Unknown alignment: ${alignment}.`);

        /**
         * @type {number[]}
         */
        const LongestPerColumn = Table.#Zip(...this.#Table).map(Column => Math.max(...Column.map(Cell => Cell.length)));
        /**
         * @type {string}
         */
        const Seperator = `+${LongestPerColumn.map(Width => "-".repeat(Width + 2)).join("+")}+`;
        /**
         * @type {string[]}
         */
        const Output = [Seperator];

        for(const Row of this.#Table) {
            /**
             * @type {string[]}
             */
            const CellStrings = [...Row.entries()].map(([Column, Cell]) => 
                alignment.startsWith("R") ? Cell.padStart(LongestPerColumn[Column]) : 
                alignment.startsWith("L") ? Cell.padEnd(LongestPerColumn[Column]) : 
                Table.#Center(Cell, LongestPerColumn[Column])
            );
            /**
             * @type {string}
             */
            const RowString = `| ${CellStrings.join(" | ")} |`;
            Output.push(RowString, Seperator);
        }
        return Output.join("\n");
    };
    
    /**
     * Generate a CSV string from the table.
     * @returns {string}
     */
    CSVify = () => this.#Table.map(Row => Row.join(",")).join("\n");

    /**
     * Generate an HTML table string.
     * @param {number} spaces - Number of spaces for Indentation.
     * @param {boolean} [header=true] - Whether to treat the first row as headers.
     * @returns {string}
     */
    HTMLify = (spaces = 4, header = true) => {
        if(Table.#GetType(spaces) !== "int")
            throw new TypeError("Parameter 'spaces' must be an integer.");
        
        if(spaces < 0)
            throw new RangeError("Parameter 'spaces' cannot be less than 0.");

        const EscapeHTML = (str) =>
            String(str).replace(/[&<>"']/g, (ch) => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[ch]));

        const Lines = [];
        const Indent = spaces > 0 ? " ".repeat(spaces) : "";
        const Newline = spaces > 0 ? "\n" : "";

        Lines.push("<table>");

        for(let r = 0; r < this.GetLength(); r++) {
            Lines.push(`${Newline}${Indent}<tr>`);
            for(const cell of this.#Table[r]) {
                const tag = header && r === 0 ? "th" : "td";
                Lines.push(`${Newline}${Indent.repeat(2)}<${tag}>${EscapeHTML(cell)}</${tag}>`);
            }
            Lines.push(`${Newline}${Indent}</tr>`);
        }

        Lines.push(`${Newline}</table>`);
        return Lines.join("");
    };

    /**
     * Get the true type of the passed in object.
     * @param {any} object 
     * @returns { "string" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "null" | "Infinity" | "-Infinity" | "NaN" | "array" | "int" | "float" } The true type of the object. null, array, int, float, infinities, and NaN included.
     */
    static #GetType = (object) => {
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
     * Center a string.
     * @param {string} string 
     * @param {number} width 
     * @param {string} pad 
     */
    static #Center = (string, width, pad = " ") => {
        if(Table.#GetType(string) !== "string")
            throw new TypeError("Param string must be a string.");

        if(Table.#GetType(pad) !== "string")
            throw new TypeError("Param pad must be a string.");

        if(Table.#GetType(width) !== "int")
            throw new TypeError("Param width must be an int.");

        if(string.length >= width)
            return string;

        const TotalPadding = width - string.length;
        const Left = Math.floor(TotalPadding / 2.0);
        const Right = TotalPadding - Left;
        return `${pad.repeat(Left)}${string}${pad.repeat(Right)}`;
    };

    static #Zip = (...Iterators) => {
        const length = Math.min(...Iterators.map(It => It.length));
        return Array.from({ length }, (_, i) => Iterators.map(It => It[i]));
    };

    /**
     * 
     * @param {number} number 
     * @param {number} min 
     * @param {number} max 
     */
    static #Clamp = (number, min, max = null) => {
        if(typeof number !== "number")
            throw new TypeError("Param number must be a number.");

        if(typeof min !== "number")
            throw new TypeError("Param min must be a number.");

        if(typeof max !== "number" || max === null)
            throw new TypeError("Param max must be a number or null.");

        if(max === null)
            [min, max] = [0, min];

        return Math.min(Math.max(number, min), max);
    };
}