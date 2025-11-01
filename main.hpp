#ifndef TABLE_HPP
#define TABLE_HPP

#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <stdexcept>
#include <format>
#include <ranges>

namespace Ext {
    using std::string;
    using std::vector;
    
    class ValueError : public std::exception {
        public:
            explicit ValueError(const string &message) : Message(message) {}
    
            const char* what() const noexcept override {
                return Message.c_str();
            }
    
        private:
            string Message;
    };
    
    class IndexError : public std::exception {
        public:
            explicit IndexError(const string &message) : Message(message) {}
            ~IndexError() noexcept override = default;
    
            const char* what() const noexcept override {
                return Message.c_str();
            }
    
        private:
            string Message;
    };
    
    class ExtString {
        public:
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
                size_t Total = width - str.size();
                size_t Left = Total / 2;
                size_t Right = Total - Left;
                return string(Left, fill) + str + string(Right, fill);
            }
    
            static string Repeat(const string &str, size_t count) {
                if(count == 0)
                    throw ValueError("count cannot be less than 1.");
                
                string Output;
                Output.reserve(str.size() * count);
    
                for(size_t i = 0; i < count; ++i)
                    Output += str;
                
                return Output;
            }
    
            static string Join(const vector<string> &vec, const string &seperator) {
                if(vec.empty()) 
                    return "";
                
                string Output = vec[0];
                for(size_t i = 1; i < vec.size(); ++i)
                    Output += seperator + vec[i];
                return Output;
            }
    };
    
    class Table {
        public:
            vector<vector<string>> TableVect;
    
            Table(int row = 1, int column = 1) {
                if(row <= 0 && column <= 0)
                    throw ValueError("Cannot create a table with 0 cells.");
    
                if(row > 0 && column <= 0)
                    column = 1;
                else if(row <= 0 && column > 0)
                    row = 1;
    
                TableVect.resize(row, vector<string>(column, ""));
            }
    
            static Table Parse(const vector<vector<string>> &table) {
                if(table.empty())
                    return Table();
    
                const int NumberOfColumns = table[0].size();
                for(size_t i = 0; i < table.size(); ++i) {
                    if(table[i].size() != NumberOfColumns) {
                        throw ValueError(std::format("Row {} has {} columns, expected {}.", i, table[i].size(), NumberOfColumns));
                    }
                }
    
                Table New;
                New.TableVect = table;
                return New;
            }
    
            void Add(string where, int count = 1) {
                if(count < 1)
                    throw ValueError("count must be greater than 0.");
    
                for(int _ = 0; _ < count; ++_) {
                    if(where == "Top" || where == "T") {
                        vector<string> NewRow(TableVect[0].size(), "");
                        TableVect.insert(TableVect.begin(), NewRow);
                    }
                    else if(where == "Bottom" || where == "B") {
                        vector<string> NewRow(TableVect[0].size(), "");
                        TableVect.push_back(NewRow);
                    }
                    else if(where == "Left" || where == "L") {
                        for(auto &Row : TableVect)
                            Row.insert(Row.begin(), "");
                    }
                    else if(where == "Right" || where == "R") {
                        for(auto &Row : TableVect)
                            Row.push_back("");
                    }
                    else {
                        throw ValueError(std::format("Unknown direction: {}.", where));
                    }
                }
            }
    
            void Set(const string &value, int row, int column) {
                if(row < 0 || row >= static_cast<int>(TableVect.size()))
                    throw IndexError("Table row index out of range.");
    
                if(column < 0 || column >= static_cast<int>(TableVect[row].size()))
                    throw IndexError("Table column index out of range.");
    
                TableVect[row][column] = value;
            }
    
            string Get(int row, int column) const {
                if(row < 0 || row >= static_cast<int>(TableVect.size()))
                    throw IndexError("Table row index out of range.");
    
                if(column < 0 || column >= static_cast<int>(TableVect[row].size()))
                    throw IndexError("Table column index out of range.");
    
                return TableVect[row][column];
            }
    
            void Delete(string type, int index) {
                const vector<string> AllowedTypes = {"Row", "R", "Column", "C"};
                if(!IsIn(AllowedTypes, type))
                    throw ValueError(std::format("Unknown type: {}.", type));
    
                if((type.starts_with("R") && index >= static_cast<int>(TableVect.size())) ||
                    (type.starts_with("C") && index >= static_cast<int>(TableVect[0].size())))
                    throw IndexError("Table index out of range.");
    
                if(type == "Row" || type == "R") {
                    TableVect.erase(TableVect.begin() + index);
                }
                else {
                    for(auto &Row : TableVect) {
                        Row.erase(Row.begin() + index);
                    }
                }
            }
    
            string Stringify(string alignment = "L") const {
                const vector<string> AllowedAlignments = {"Left", "Right", "Center", "L", "R", "C"};
                if(!IsIn(AllowedAlignments, alignment))
                    throw ValueError(std::format("Unknown alignment: {}.", alignment));
    
                vector<int> LongestPerColumn = Map(Zip(TableVect), [](const vector<string> &Column) {
                    size_t maxlen = 0;
                    for(const auto &Cell : Column)
                        maxlen = std::max(maxlen, Cell.size());
                    return static_cast<int>(maxlen);
                });
    
                string Separator = "+" + ExtString::Join(Map(LongestPerColumn,
                    [](int Width) { return ExtString::Repeat("-", Width + 2); }), "+") + "+";
    
                vector<string> Output = {Separator};
    
                for(const auto &Row : TableVect) {
                    vector<string> CellStrings;
                    for(size_t j = 0; j < Row.size(); ++j) {
                        const auto &Cell = Row[j];
                        if(alignment.starts_with("R"))
                            CellStrings.push_back(ExtString::RJust(Cell, LongestPerColumn[j]));
                        else if(alignment.starts_with("L"))
                            CellStrings.push_back(ExtString::LJust(Cell, LongestPerColumn[j]));
                        else
                            CellStrings.push_back(ExtString::Center(Cell, LongestPerColumn[j]));
                    }
                    string RowStr = "| " + ExtString::Join(CellStrings, " | ") + " |";
                    Output.push_back(RowStr);
                    Output.push_back(Separator);
                }
    
                return ExtString::Join(Output, "\n");
            }
    
        private:
            template <typename T, typename Func>
            static auto Map(const vector<T> &vec, Func func) {
                using ResultType = decltype(func(std::declval<T>()));
                vector<ResultType> Result;
                Result.reserve(vec.size());
                for(const auto &item : vec)
                    Result.push_back(func(item));
                return Result;
            }
            
            template <typename T>
            static vector<std::pair<size_t, T*>> Enumerate(vector<T> &vec) {
                vector<std::pair<size_t, T*>> Result;
                for(size_t i = 0; i < vec.size(); ++i)
                    Result.emplace_back(i, &vec[i]);
                return Result;
            }
    
            static vector<vector<string>> Zip(const vector<vector<string>> &data) {
                if(data.empty()) 
                    return {};
                
                size_t Rows = data.size(), Columns = data[0].size();
                vector<vector<string>> Result(Columns, vector<string>(Rows));
                for(size_t i = 0; i < Rows; ++i) {
                    for(size_t j = 0; j < Columns; ++j) {
                        Result[j][i] = data[i][j];
                    }
                }
                return Result;
            }
    
            template <typename T>
            static bool IsIn(const vector<T> &container, const T &element) {
                return std::find(container.begin(), container.end(), element) != container.end();
            }
    };
}
#endif