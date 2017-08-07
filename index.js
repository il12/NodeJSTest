const MyForm = {
    validate: ()=>{
        //Инициализируем результирующий массив с признаком результата валидации.
        //По умолчанию - ввалидация пройдена успешна
        const result = {isValid: true, errorFields: []};
        //Валидируем форму
        const validate = validateForm();
        //Проверяем форму на валидность, при её отсутствии записываем в результирующий массив
        //отрицательный результат валидации и поля, её не прошедшие.
        if(validate instanceof Array){
            result.isValid = false;
            result.errorFields = validate;
        }
        //Возвращаем результирующий массив
        return result;
    },
    getData: () => ({
        fio: document.getElementsByName('fio')[0].value.trim(),
        email: document.getElementsByName('email')[0].value.trim(),
        phone: document.getElementsByName('phone')[0].value.trim()
    }),
    setData: (obj) => {
        document.getElementsByName('fio')[0].value = obj.fio;
        document.getElementsByName('email')[0].value = obj.email;
        document.getElementsByName('phone')[0].value = obj.phone;
    },
    submit: () => {
        //Валидируем форму
        const validate = validateForm();
        if (validate instanceof Array) {
            //Добавляем полям не прошедшим валидацию класс 'error'
            for (let i of validate){
                document.getElementsByName(i)[0].classList.add('error')
            }
        } else {
            //Деактивируем кнопку "Отправить"
            document.getElementById('submitButton').disabled = true;
            //Отправляем запрос на адрес, указанный в атрибуте action формы.
            let sendRequest = setTimeout(
                send = () => {
                    axios({
                        method: 'post',
                        url: document.forms[0].action,
                        data: MyForm.getData()
                    })
                        .then((res) => {
                            //Присваиваем класс ответа, контейнеру. При необходимости, через timeout миллисекунд повторяем запрос
                            document.getElementById("resultContainer").classList.add(res.data.status);
                            if (res.data.status === "success") {
                                document.getElementById("resultContainer").innerHTML = res.data.status;
                            }
                            if (res.data.status === "error") {
                                document.getElementById("resultContainer").innerHTML = res.data.reason;
                            }
                            if (res.data.status === "progress") {
                                sendRequest = setTimeout(send, res.data.timeout);
                            }
                        });
                }
                ,1);
        }
    }
};

const validateForm = () => {
    //Получаем данные из формы
    let fio = document.getElementsByName('fio')[0].value.trim();
    let email = document.getElementsByName('email')[0].value.trim();
    let phone = document.getElementsByName('phone')[0].value;

    //Иницилизируем массив, в котором будут храниться названия неправильных полей
    let finalValidationArray = [];

    let emailCount, fioCount = 0;
    let fioTestValues = /[а-яА-Я]/g;
    let phoneTestFormat = /\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/;
    let emailTestValues = [/@ya.ru$/, /@yandex.ru$/, /@yandex.ua$/, /@yandex.by$/, /@yandex.kz$/, /@yandex.com$/];

    //Проверяем e-mail на доменные зоны.
    for (let i of emailTestValues){
        emailCount += i.test(email);
    }

    //Проверяем ФИО на наличие 3 слов
    for (let i of fio.split(' ')){
        fioCount += (i.search(fioTestValues) !== -1);
    }

    //Суммируем цифры номера телефона
    let phoneNumbersSum = String(parseInt(phone.replace(/\D+/g,""))).split("").reduce((sum, current)=>Number(sum) + Number(current));

    //Устанавливаем значения переменных, для опреления их валидности
    let isFioValid = fioCount === 3;
    let isEmailValid = emailCount !== 0;
    let isPhoneValid = phoneTestFormat.test(phone) && phoneNumbersSum<=30;

    //Добавляем названия неправильно заполненных полей в массив
    if (!isFioValid) finalValidationArray.push('fio');
    if (!isEmailValid) finalValidationArray.push('email');
    if (!isPhoneValid) finalValidationArray.push('phone');

    //Возвращаем массив с неправильными ответами или булево значение true.
    if (finalValidationArray.length === 0){
        return true
    } else{
        return finalValidationArray
    }
};

//Добавляем обработчик нажатия на кнопку "Отправить"
let but = document.getElementById("submitButton");
but.addEventListener('click', MyForm.submit);
