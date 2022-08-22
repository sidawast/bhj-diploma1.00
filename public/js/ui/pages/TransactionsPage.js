/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor( element ) {
    this.element = element;
    this.registerEvents();
    this.update();
    this.lastOptions = null;
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {

    this.render({ account_id: this.element.dataset.id});
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
      this.element.querySelector('.remove-account').onclick = e => {
        this.removeAccount();
      }
    
      
      document.querySelectorAll('.content').forEach(btn => btn.onclick = e => {
        if (e.target.closest('.transaction__remove')) {
          console.log(e.target.closest('.transaction__remove'))
          this.removeTransaction(e.target.dataset.id);
        }
      e.preventDefault();     
        })
      
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
   * либо обновляйте только виджет со счетами и формы создания дохода и расхода
   * для обновления приложения
   * */
  removeAccount() {
    if(this.lastOptions) {
      let accountBank = confirm("Вы действительно хотите удалить счет ?");
      if(accountBank) {
        Account.remove({ id: this.lastOptions.account_id }, (err, resp) => { // При нажатие будет удален счет ID:1
          if (resp && resp.success) {
            App.updateWidgets();
            App.updateForms();
            //App.update();
            this.clear();
          } else {
            throw new Error(`Ошибка при удалении счета`);
          }
        });
      }
    }
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction( id ) {
    if(confirm("Вы действительно хотите удалить транзакцию ?")) {
      Transaction.remove( {id: id} , (err, resp) => { // При нажатие будет удалена транзакция ID
       
        App.updateWidgets();
        App.updateForms();
        App.updatePages();  
        App.update();        
        this.update();
//  Не происходит обновление панели транзакции
      });
    }
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options){

    this.lastOptions = options;
    if(options.account_id) {
      Account.get(options.account_id, (err, resp) => {
        if(resp && resp.success) {
          this.renderTitle(resp.data.name); 
        }
      })
      Transaction.list({account_id: options.account_id}, (err, resp) => { 
        this.renderTransactions(resp.data)    
      })
    }
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    this.renderTransactions([]);
    this.renderTitle("Название счёта");
    this.lastOptions = null;
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name){
    this.element.querySelector('.content-title').innerText = name;
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date){
    let time = new Date(date);
    let month = [
                  'января',
                  'февраля',
                  'марта',
                  'апреля',
                  'мая',
                  'июня',
                  'июля',
                  'августа',
                  'сентября',
                  'октября',
                  'ноября',
                  'декабря'
                ];
    
    let monthNumb = time.getMonth();
    let nowMonth = month[monthNumb];
    let nowDay = time.getDate();
    let nowYear = time.getFullYear();
    let nowHour = time.getHours();
    let nowMinutes = time.getMinutes();
    if (nowMinutes < 10) {
        nowMinutes = '0' + nowMinutes;
    }
    if (nowHour < 10) {
      nowHour = '0' + nowHour;
    }

    return `${nowDay} ${nowMonth} ${nowYear} г. в ${nowHour}:${nowMinutes}`;
  
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item){

    let date = this.formatDate(item.created_at);

    return `<div class="transaction transaction_${item.type} row">
    <div class="col-md-7 transaction__details">
      <div class="transaction__icon">
          <span class="fa fa-money fa-2x"></span>
      </div>
      <div class="transaction__info">
          <h4 class="transaction__title">${item.name}</h4>
          <!-- дата -->
          <div class="transaction__date">${date}</div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="transaction__summ">
      <!--  сумма -->
      ${item.sum} <span class="currency">₽</span>
      </div>
    </div>
    <div class="col-md-2 transaction__controls">
        <!-- в data-id нужно поместить id -->
        <button class="btn btn-danger transaction__remove" data-id="${item.id}">
            <i class="fa fa-trash"></i>  
        </button>
    </div>
</div>`
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data){
    let transaction = this.element.querySelector('.content');
    let transactionHTML = '';
    if (data) {
      for (let i = 0; i < data.length; i++) {
        transactionHTML += this.getTransactionHTML(data[i]);
      }
    }   
    transaction.innerHTML = transactionHTML;
  }
}