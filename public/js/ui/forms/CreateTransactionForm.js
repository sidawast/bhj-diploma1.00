/**
 * Класс CreateTransactionForm управляет формой
 * создания новой транзакции
 * */
class CreateTransactionForm extends AsyncForm {
  /**
   * Вызывает родительский конструктор и
   * метод renderAccountsList
   * */
  constructor(element) {
    super(element);
    this.renderAccountsList();
  }

  /**
   * Получает список счетов с помощью Account.list
   * Обновляет в форме всплывающего окна выпадающий список
   * */
  renderAccountsList() {
    let select = document.querySelectorAll('.accounts-select'); // Переписать по требованию преподавателя
    Account.list(null, (err, resp) => {
      select.forEach(item => item.innerHTML = "")

      if(resp) {
        resp.data.forEach(element => { 
          Array.from(select).reduce((sum, current) => sum + current.insertAdjacentHTML('beforeend', `<option value="${element.id}">${element.name}</option>`))
        });
        /*resp.data.forEach(element => { 
          select.forEach(item => item.insertAdjacentHTML('beforeend',
           `<option value="${element.id}">${element.name}</option>`)           
          )
        }); */
      }
    })
  }

  /**
   * Создаёт новую транзакцию (доход или расход)
   * с помощью Transaction.create. По успешному результату
   * вызывает App.update(), сбрасывает форму и закрывает окно,
   * в котором находится форма
   * */
  onSubmit(data) {
    
    Transaction.create(data, (err, response) => {
      if (response) {
        if(data.type == 'income') {
          App.getModal('newIncome').close();
        }    // let windowName = 'new' + type[0].toUpperCase() + type.slice(1);
        if(data.type == 'expense') {
          App.getModal('newExpense').close();
        }
        App.update();
        this.element.reset();
      } 
    })          
  }
}