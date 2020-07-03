$(function(){
    // TODO: ADAPTIVE DESIGN
    const DAY_STRING = ['день', 'дня', 'дней'];

    const DATA = {
        whichSite: ['landing', 'multiPage', 'store'],
        price: [4000, 8000, 26000],
        desktopTemplates: [50, 40, 30],
        adapt: 20,
        mobileTemplates: 15,
        editable: 10,
        metrikaYandex: [500, 1000, 2000],
        analyticsGoogle: [850, 1350, 3000],
        sendOrder: 500,
        deadlineDay: [[2, 7], [3, 10], [7, 14]],
        deadlinePercent: [20, 17, 15],
    };

    const $startButton = $('.main-button').eq(0),
        $window = $(window),
        firstScreen = document.querySelector('.first-screen'),
        mainForm = document.querySelector('.main-form'),
        total = document.querySelector('.total'),
        endButton = document.querySelector('.end-button'),
        formCalculate = document.querySelector('.form-calculate'),
        fastRange = document.querySelector('.fast-range'),
        totalPriceSum = document.querySelector('.total_price__sum'),
        typeSite = document.getElementById('data-site'),
        deadline = document.querySelector('.deadline'),
        rangeDeadline = document.querySelector('.range-deadline'),
        deadlineValue = document.querySelector('.deadline-value'),
        textCalc = document.querySelector('.text-calc'),
        adapt = document.getElementById('adapt'),
        editable = document.getElementById('editable'),
        metrikaYandex = document.getElementById('metrikaYandex'),
        analyticsGoogle = document.getElementById('analyticsGoogle'),
        sendOrder = document.getElementById('sendOrder'),
        cardHead = document.querySelector('.card-head'),
        totalPrice = document.querySelector('.total_price');

    function hideElements(element){
        $(element).addClass('hidden');
    }

    function showElements(element){
        $(element).removeClass('hidden');
    }

    function dopOptionsString(){
        // Подключим Яндекс Метрику, Гугл Аналитику и отправку заявок на почту.
        let str = '';

        if(metrikaYandex.checked || analyticsGoogle.checked || sendOrder.checked){
            str += 'Подключим';

            if(metrikaYandex.checked){
                str += ' Яндекс Метрику';

                if(analyticsGoogle.checked && sendOrder.checked){
                    str += ', Гугл Аналитику и отправку заявок на почту.';
                    return str;
                } 

                if(analyticsGoogle.checked || sendOrder.checked){
                    str += ' и';
                }
            }

            if(analyticsGoogle.checked){
                str += ' Гугл Аналитику';

                if(sendOrder.checked){
                    str += ' и';
                }
            }

            if(sendOrder.checked){
                str += ' отправку заявок на почту';
            }

            str += '.';
        }
        return str;
    }

    function renderText(result, site, maxDay, minDay){
        
        $(totalPriceSum).text(result);
        $(typeSite).text(site);
        $(deadline).text(declOfNum(maxDay, DAY_STRING, true));
        rangeDeadline.min = minDay;
        rangeDeadline.max = maxDay;
        $(deadlineValue).text(declOfNum($(rangeDeadline).val(), DAY_STRING, true));

        textCalc.textContent = `
        Сделаем ${site}${adapt.checked ? 
        ', адаптированный под мобильные устройства и планшеты' : ''}.
        ${editable.checked ? `Установим панель админстратора,
        чтобы вы могли самостоятельно менять содержание на сайте без разработчика.` : ''}
        ${dopOptionsString()}`;
    }

    function declOfNum(n, titles, from) {
		return n + ' ' + titles[from ? n % 10 === 1 && n % 100 !== 11 ? 1 : 2 : n % 10 === 1 && n % 100 !== 11 ?
			0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
	}

    function priceCalculation(element = {}){

        let result = 0,
            index = 0,
            options = [],
            site = '',
            maxDayDeadline = DATA.deadlineDay[index][1],
            minDayDeadline = DATA.deadlineDay[index][0],
            overPercent = 0;

        if(element.name === 'whichSite') {

            $(formCalculate).find('[type="checkbox"]').each(function(){
                $(this).prop('checked', false);
            });
            hideElements(fastRange);
        }

        for(const item of formCalculate.elements) {

            if(item.name === "whichSite" && item.checked){
                index = DATA.whichSite.indexOf(item.value);
                site = item.dataset.site;
                maxDayDeadline = DATA.deadlineDay[index][1];
                minDayDeadline = DATA.deadlineDay[index][0];
            } else if (item.checked) {

                if(item.value !== 'on'){
                    options.push(item.value);
                    $('[value="' + item.value + '"]').next().next().text('Да');
                }
            } 
            
            if (item.classList.contains('want-faster') && item.checked){
                const overDay = maxDayDeadline - rangeDeadline.value;
                overPercent = overDay * (DATA.deadlinePercent[index] / 100);
            }
            
            if ($('#adapt').prop('checked')){
                $('.mobileDesign').removeClass('mobileDesign').addClass('slider-indicator');
                $('#mobileTemplates').prop('disabled', false);
            } else if (!$('#adapt').prop('checked')){
                $('#mobileTemplates').next().next().text('Нет');
                $('#mobileTemplates').prop('checked', false);
                $('#mobileDesign').removeClass('slider-indicator').addClass('mobileDesign');
                $('#mobileTemplates').prop('disabled', true);
            } 

            if (!item.checked) {
                $('[value="' + item.value + '"]').next().next().text('Нет');
            }
        }

        result += DATA.price[index];

        options.forEach(function(key){
            if(typeof(DATA[key]) === 'number'){

                if(key === 'sendOrder'){
                    result += DATA[key];
                } else {
                    result += DATA.price[index] * DATA[key] / 100;
                }
            } else if (key === ''){
                options.remove('');
            } else {

                if(key === 'desktopTemplates'){
                    result += DATA.price[index] * DATA[key][index] / 100;
                } else {
                    result += DATA[key][index];
                }
            }
        });
        
        result += result * overPercent;

        renderText(result, site, maxDayDeadline, minDayDeadline);
    }

    function handlerCallBackForm(event){
        const target = event.target;

        if($(target).hasClass('want-faster')){
            $(target).prop('checked') ? showElements($(fastRange)) : hideElements($(fastRange));
            priceCalculation($(target));
        }

        if($(target).hasClass('calc-handler')){
            priceCalculation($(target));
        }
    }
    
    $startButton.on('click', function(event){
        hideElements($(firstScreen));
        showElements(mainForm);
    });

    $(endButton).click(function(event){
        event.preventDefault();
        cardHead.textContent = 'Заявка на создание сайта';
        hideElements(totalPrice);
        hideElements($(formCalculate).find('fieldset'));
        showElements(total);
    });

    $('.button').click(function(event){
        event.preventDefault();
    });

    $(formCalculate).change(handlerCallBackForm);
    priceCalculation();
});