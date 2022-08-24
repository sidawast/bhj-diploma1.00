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
    Account.list(null, (err, resp) => {
      if(resp) {

        this.element.querySelector('.accounts-select').insertAdjacentHTML('beforeend', resp.data.reduce((sum, current) => sum +`<option value="${current.id}">${current.name}</option>`, this.element.querySelector('.accounts-select').innerHTML = ""))
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