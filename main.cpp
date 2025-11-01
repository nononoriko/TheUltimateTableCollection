#include <iostream>
#include <vector>
#include <concepts>
#include <ranges>
#include <string>
#include <exception>
#include <utility>
#include <format>
#include <algorithm>
#include <iterator>
#include <tuple>
#include <type_traits>

using std::vector;
using std::string;
using std::exception;

class ValueError : public std::exception {
    public:
        explicit ValueError(const string& message) : Message(message) {}

        const char* what() const noexcept override {
            return Message.c_str();
        }

    private:
        string Message;
};

class IndexError : public std::exception {
    public:
        explicit IndexError(const string& message) : Message(message) {}
        ~IndexError() noexcept override = default;

        const char* what() const noexcept override {
            return Message.c_str();
        }

    private:
        string Message;
};

class Table {
    public:
        vector<vector<string>> TableVect;

        Table(int row = 0, int column = 0) {
            if(row <= 0 && column <= 0)
                return;

            if(row > 0 && column <= 0)
                column = 1;
            else if(row <= 0 && column > 0)
                row = 1;

            while(this->TableVect.size() < row)
                this->TableVect.push_back(vector<string>());

            for(int i = 0; i < row; ++i) {
                while(this->TableVect[i].size() < column) {
                    this->TableVect[i].push_back("");
                }
            }
        }

        static Table Parse(vector<vector<string>> table) {
            if(table.size() == 0) 
                return Table();

            const int NumberOfColumns = table[0].size();
            for(auto &[i, RowPtr] : Enumerate(table)) {
                auto &Row = *RowPtr;
                if(Row.size() != NumberOfColumns) {
                    throw ValueError(std::format("Row {} has {} columns, expected {}.", i, Row.size(), NumberOfColumns));
                }
            }

            vector<vector<string>> ProcessedTable;
            for(auto &[i, RowPtr] : Enumerate(table)) {
                auto &Row = *RowPtr;
                vector<string> NewRow;
                for(auto &[j, CellPtr] : Enumerate(Row)) {
                    auto &Cell = *CellPtr;
                    NewRow.push_back(Cell);
                }
                ProcessedTable.push_back(NewRow);
            }

            Table New = Table();
            New.TableVect = ProcessedTable;
            return New;
        }

        void Add(string where, int count = 1) {
            if(count < 1) {
                throw ValueError("count must be greater than 0.");
            }

            for(int _ = 0; _ < count; ++_) {
                if(where == "Top" || where == "T") {
                    vector<string> NewRow(this->TableVect[0].size(), "");
                    this->TableVect.insert(this->TableVect.begin(), NewRow);
                }
                else if(where == "Bottom" || where == "B") {
                    std::vector<std::string> NewRow(TableVect[0].size(), "");
                    TableVect.push_back(NewRow);
                }
                else if(where == "Left" || where == "L") {
                    for(auto &Row : TableVect) {
                        Row.insert(Row.begin(), "");
                    }
        
                }
                else if(where == "Right" || where == "R") {
                    for(auto &Row : TableVect) {
                        Row.push_back("");
                    }
                }
                else {
                    throw ValueError(std::format("Unknown direction: {}.", where));
                }
            }
        }

        void Set(string value, int row, int column) {
            if(row > this->TableVect.size() - 1 || row < 0) 
                throw IndexError("Table row index out of range.");
            
            if(column > this->TableVect[row].size() - 1 || column < 0)
                throw IndexError("Table column index out of range.");

            this->TableVect[row][column] = value;
        }

        void Delete(string type, int index) {
            const vector<string> AllowedTypes = {"Row", "R", "Column", "C"};
            if(!IsIn(AllowedTypes, type))
                throw ValueError(std::format("Unknown type: {}.", type));

            if(type.starts_with("R") && index > this->TableVect.size() - 1)
                throw IndexError("Table row index out of range.");
    
            if(type.starts_with("C") && index > this->TableVect[0].size() - 1)
                throw IndexError("Table column index out of range.");
            
            if(type == "Row" || type == "R") {
                this->TableVect.erase(this->TableVect.begin() + index);
            }
            else for(int i = 0; i < this->TableVect.size(); ++i) {
                this->TableVect[i].erase(this->TableVect[i].begin() + index);
            }
        }

        string Get(int row, int column) {
            if(row > this->TableVect.size() - 1 || row < 0) 
                throw IndexError("Table row index out of range.");
            
            if(column > this->TableVect[row].size() - 1 || column < 0)
                throw IndexError("Table column index out of range.");

            return this->TableVect[row][column];
        }

        string Stringify(string alignment) {
            const vector<string> AllowedAlignmentTypes = {"Left", "Right", "Center", "L", "R", "C"};
            if(!IsIn(AllowedAlignmentTypes, alignment)) {
                throw ValueError(std::format("Unknown alignment: {}.", alignment));
            }

            const vector<int> LongestPerColumn = Map(Zip(this->TableVect), [](vector<string> Column){
                return std::max(Map(Column, [](string Cell) { return Cell.size(); }));
            });

            const string Seperator = "+" + Join(Map(LongestPerColumn, [](int Width) { return Repeat("-", Width + 2); }), "+") + "+";
            vector<string> Output = { Seperator };
            for(size_t Row = 0; Row < this->TableVect.size(); ++Row) {
                const vector<string> CellStrings = Map(Enumerate(this->TableVect[Row]), [](int Column, string Cell) {
                    return alignment.starts_with("R") ? RJust(Cell, LongestPerColumn[Column]) :
                    alignment.starts_with("L") ? LJust(Cell, LongestPerColumn[Column]) :
                    Center(Cell, LongestPerColumn[Column]);
                });
                const string RowString = "| " + Join(CellStrings, " | ") + " |";
                Output.push_back(RowString);
                Output.push_back(Seperator);
            }
            return Join(Output, "\n");
        }
        
    private:
        template <typename T>
        static auto Enumerate(T& iterable) {
            vector<std::pair<size_t, typename T::value_type*>> Result;
            size_t i = 0;
            for(auto &item : iterable)
                Result.emplace_back(i++, &item);
            return Result;
        }

        template <typename Container, typename Func>
        static auto Map(const Container &input, Func func) {
            using ResultType = decltype(func(*input.begin()));
            vector<ResultType> Result;
            Result.reserve(input.size());
            std::transform(input.begin(), input.end(), std::back_inserter(Result), func);
            return Result;
        }

        template <typename Container>
        static auto Zip(const Container& data) {
            using Inner = typename Container::value_type;
            using T = typename Inner::value_type;

            if(data.empty())
                return vector<vector<T>>{};

            size_t Rows = data.size();
            size_t Columns = data.front().size();

            vector<vector<T>> result(Columns, vector<T>(Rows));

            for(size_t i = 0; i < Rows; ++i) {
                for(size_t j = 0; j < Columns; ++j) {
                    result[j][i] = data[i][j];
                }
            }

            return result;
        }

        template <typename Container, typename TypeItem>
        static bool IsIn(const Container &container, const TypeItem &element) {
            return std::find(container.begin(), container.end(), element) != container.end();
        }

        static string LJust(const string &str, size_t width, char fill = ' ') {
            if(str.size() >= width) 
                return str;
            return str + string(width - str.size(), fill);
        }

        static string RJust(const string &str, size_t width, char fill = ' ') {
            if(str.size() >= width) 
                return str;
            return string(width - str.size(), fill) + str;
        }

        static string Center(const string &str, size_t width, char fill = ' ') {
            if(str.size() >= width) 
                return str;
            size_t TotalPad = width - str.size();
            size_t LeftPad = TotalPad / 2;
            size_t RightPad = TotalPad - LeftPad;
            return string(LeftPad, fill) + str + string(RightPad, fill);
        
        }

        static string Repeat(string str, size_t count) {
            if(count <= 0) {
                throw ValueError("count cannot be less than 1.");
            }
            
            string Output = "";
            for(size_t _ = 0; _ < count; ++_) {
                Output += str;
            }
            return Output;
        }
        
        static string Join(const vector<string> &vec, const string seperator) {
            if(vec.empty())
                return "";

            string Output = vec[0];
            for(size_t i = 1; i < vec.size(); ++i) {
                Output += seperator + vec[i];
            }
            return Output;
        }
};

int main() {
    std::cout << "Hello World!";
    return 0;
}