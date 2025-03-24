// Откатывает транзакцию, закрывает соединение и возвращает 
// пользователю ошибку
exports.showDBError = (con, err) => {
    con.rollback();
    con.end();
    console.log('Content-Type: application/json\n');
    console.log('Ошибка в БД:\n', err);
}