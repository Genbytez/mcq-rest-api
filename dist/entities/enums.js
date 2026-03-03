"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionType = exports.Difficulty = exports.AttemptStatus = exports.ExamStatus = exports.UserStatus = void 0;
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["BLOCKED"] = "BLOCKED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var ExamStatus;
(function (ExamStatus) {
    ExamStatus["DRAFT"] = "DRAFT";
    ExamStatus["PUBLISHED"] = "PUBLISHED";
    ExamStatus["CLOSED"] = "CLOSED";
})(ExamStatus || (exports.ExamStatus = ExamStatus = {}));
var AttemptStatus;
(function (AttemptStatus) {
    AttemptStatus["NOT_STARTED"] = "NOT_STARTED";
    AttemptStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AttemptStatus["SUBMITTED"] = "SUBMITTED";
    AttemptStatus["AUTO_SUBMITTED"] = "AUTO_SUBMITTED";
    AttemptStatus["CANCELLED"] = "CANCELLED";
})(AttemptStatus || (exports.AttemptStatus = AttemptStatus = {}));
var Difficulty;
(function (Difficulty) {
    Difficulty["EASY"] = "EASY";
    Difficulty["MEDIUM"] = "MEDIUM";
    Difficulty["HARD"] = "HARD";
})(Difficulty || (exports.Difficulty = Difficulty = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["MCQ"] = "MCQ";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
