import { COMPANY } from '../../constants/company';
import { LEGAL_EDITION } from './meta';
import type { LegalDoc } from './types';

const { name, inn, ogrn, address, email, phoneDisplay } = COMPANY;

export const offerRu: LegalDoc = {
  title: 'Публичная оферта',
  lead: 'Условия оказания услуг сервиса Card Genius AI. Это предложение заключить договор с любым, кто его примет.',
  edition: `Редакция от ${LEGAL_EDITION.ru}`,
  sections: [
    {
      id: 'general',
      title: '1. Общие положения',
      blocks: [
        {
          type: 'p',
          text: `Настоящий документ является публичной офертой ${name} (далее — Исполнитель) в смысле статей 435 и 437 Гражданского кодекса Российской Федерации. Оферта адресована любому дееспособному лицу и предлагает заключить договор возмездного оказания услуг (глава 39 Гражданского кодекса Российской Федерации), а в части бесплатного тарифа — договор безвозмездного использования соответствующей функциональности.`,
        },
        {
          type: 'p',
          text: 'Сервис предназначен для лиц, которым исполнилось 18 лет. Исполнитель не собирает данные детей сознательно. Если вы считаете, что ребёнок передал нам данные, напишите на почту, указанную в реквизитах: мы удалим их, если закон не требует хранения.',
        },
        {
          type: 'p',
          text: 'Если заказчик приобретает услугу для личных, семейных или иных нужд, не связанных с предпринимательством, он является потребителем. К таким отношениям применяется Закон Российской Федерации «О защите прав потребителей». Условия оферты, которые ущемляют права потребителя по сравнению с законом, не применяются.',
        },
        {
          type: 'p',
          text: 'Оферта, описание услуги на сайте и карточки тарифов с ценами составляют единый договор. К отношениям сторон применяется право Российской Федерации.',
        },
      ],
    },
    {
      id: 'terms',
      title: '2. Термины',
      blocks: [
        {
          type: 'list',
          items: [
            'Сервис — программа Card Genius AI на сайте Исполнителя: личный кабинет, обработка изображений и текстов карточек товаров, история результатов.',
            'Заказчик — лицо, которое приняло оферту.',
            'Личный кабинет — закрытый раздел Сервиса, доступный после регистрации по адресу электронной почты и паролю.',
            'Тариф — набор возможностей и лимит задач или скачиваний с ценой, опубликованной на сайте на момент оплаты.',
            'Материалы — фотографии, названия, описания и иные сведения, которые Заказчик загружает или вводит для обработки.',
            'Результат — изображения и тексты, которые Сервис сформировал по заданию Заказчика и показал в личном кабинете.',
          ],
        },
      ],
    },
    {
      id: 'service',
      title: '3. Предмет договора',
      blocks: [
        {
          type: 'p',
          text: 'Исполнитель предоставляет Заказчику удалённый доступ к Сервису и оказывает услугу по автоматической подготовке визуала и текстов для карточек товаров. Состав операций определяется интерфейсом на момент запуска и может включать удаление фона, генерацию фона, работу с экспозицией, улучшение изображения, инфографику и тексты карточки.',
        },
        {
          type: 'p',
          text: 'Услуга оказывается в электронном виде. Курьер, почта и иная физическая доставка не используются. После регистрации Заказчик входит в личный кабинет. После успешной оплаты платного тарифа в кабинете становится доступен оплаченный лимит. Готовый результат Заказчик смотрит и скачивает там же, а также находит его в истории кабинета.',
        },
        {
          type: 'p',
          text: 'Сервис помогает подготовить материалы для маркетплейсов. Договор с площадкой Заказчик заключает сам. Исполнитель не гарантирует, что площадка примет карточку, и не обещает рост продаж, просмотров или конверсии.',
        },
      ],
    },
    {
      id: 'acceptance',
      title: '4. Акцепт оферты',
      blocks: [
        {
          type: 'p',
          text: 'Акцептом оферты в части регистрации и доступа к личному кабинету является отдельная отметка о принятии оферты в форме регистрации и отправка этой формы (статья 438 Гражданского кодекса Российской Федерации). Договор в этой части считается заключённым с момента создания учётной записи.',
        },
        {
          type: 'p',
          text: 'Акцептом оферты в части конкретного платного тарифа является его оплата. Договор на этот тариф считается заключённым с момента подтверждения успешного платежа. Если тариф на сайте указан как бесплатный, отдельная оплата не нужна: его лимит предоставляется после регистрации.',
        },
        {
          type: 'note',
          text: 'Отметка о принятии оферты не является согласием на обработку персональных данных. Согласие даётся отдельно, своим действием, и описано в [Политике обработки персональных данных](/privacy). Так требует часть 1 статьи 9 Федерального закона от 27.07.2006 № 152-ФЗ.',
        },
      ],
    },
    {
      id: 'account',
      title: '5. Регистрация и личный кабинет',
      blocks: [
        {
          type: 'p',
          text: 'Для кабинета нужны действующий адрес электронной почты и пароль. Заказчик указывает достоверный email и сам сохраняет доступ к почте и паролю. Действия, совершённые в кабинете после входа, считаются действиями Заказчика, пока он не сообщит Исполнителю о несанкционированном доступе.',
        },
        {
          type: 'p',
          text: 'Один человек использует одну учётную запись на своё имя. Передавать кабинет третьим лицам нельзя, если стороны письменно не договорились об ином. Исполнитель может заблокировать доступ, если кабинет используется для взлома, рассылки вредоносного кода или размещения запрещённого материала, и сообщит об этом на email Заказчика, когда это возможно.',
        },
      ],
    },
    {
      id: 'performance',
      title: '6. Как оказывается услуга',
      blocks: [
        {
          type: 'list',
          items: [
            'Заказчик выбирает тариф на сайте. Актуальные цены и лимиты опубликованы в разделе «Тарифы».',
            'Для платного тарифа Заказчик оплачивает его через платёжный сервис. Бесплатный тариф оплаты не требует.',
            'Исполнитель открывает в кабинете лимит выбранного тарифа: число задач или число скачиваний — как написано в карточке тарифа.',
            'Заказчик загружает фото товара и при необходимости указывает название и описание, затем запускает обработку.',
            'Результат появляется в личном кабинете. Его можно посмотреть, отредактировать доступными в интерфейсе средствами и скачать. Копия остаётся в истории кабинета, пока запись не удалена.',
          ],
        },
        {
          type: 'p',
          text: 'Конкретная операция считается оказанной, когда результат доступен Заказчику в кабинете для просмотра или скачивания. Если операция не завершилась по причине на стороне Исполнителя и результата нет, она не считается оказанной: лимит по этой операции восстанавливается либо Заказчик вправе требовать возврат соответствующей части оплаты.',
        },
        {
          type: 'p',
          text: 'Исполнение начинается сразу после регистрации, оплаты или запуска обработки, потому что услуга состоит в немедленном электронном доступе. Лимит не сгорает по скрытому сроку: он действует, пока не израсходован, если в карточке тарифа прямо не указан другой срок.',
        },
      ],
    },
    {
      id: 'payment',
      title: '7. Цена и оплата',
      blocks: [
        {
          type: 'p',
          text: 'Цена указана в рублях Российской Федерации в карточке тарифа на момент оплаты и включает платежи, которые закон требует включать в цену для потребителя. Если применяется НДС, сумма налога отражается в кассовом чеке. Оплата тарифа по старой цене после её замены на сайте не производится: для нового заказа действует цена, которую Заказчик видит перед оплатой.',
        },
        {
          type: 'p',
          text: `Платёж принимается через сервис ЮKassa (оператор платежей — ООО НКО «ЮМани»). Номер карты и код безопасности Заказчик вводит на стороне платёжного сервиса. Исполнитель эти реквизиты карты не получает и не хранит. Исполнитель получает подтверждение платежа: сумму, статус и идентификатор операции. В случаях, предусмотренных Федеральным законом от 22.05.2003 № 54-ФЗ, кассовый чек направляется на email Заказчика.`,
        },
        {
          type: 'p',
          text: 'Тариф считается оплаченным с момента подтверждения успешного платежа. Если деньги списаны, а доступ не открылся, Заказчик пишет на почту Исполнителя: доступ открывают либо деньги возвращают.',
        },
      ],
    },
    {
      id: 'refund',
      title: '8. Отказ от договора и возврат',
      blocks: [
        {
          type: 'p',
          text: 'Потребитель вправе отказаться от исполнения договора в любое время при условии оплаты Исполнителю фактически оказанных услуг (статья 32 Закона «О защите прав потребителей», статья 782 Гражданского кодекса Российской Федерации). Заказчик, который не является потребителем, вправе отказаться на тех же условиях, если закон не устанавливает иной порядок.',
        },
        {
          type: 'p',
          text: 'Возвращается плата за неоказанную часть: неиспользованный лимит и операции, которые не были оказаны. Плата за операции, которые уже оказаны надлежащим образом и результат которых Заказчик получил, не возвращается. Исполнитель не удерживает сверх этого отдельную «стоимость расходов», если не подтвердит их размер.',
        },
        {
          type: 'p',
          text: 'Если услуга оказана с недостатком, потребитель вправе по своему выбору требовать безвозмездного устранения, повторного оказания, соразмерного уменьшения цены или возврата уплаченного за некачественную часть (статья 29 Закона «О защите прав потребителей»).',
        },
        {
          type: 'p',
          text: `Заявление направляется на ${email} с адреса учётной записи. В письме нужны тариф, дата и сумма платежа и суть требования. Деньги возвращаются в течение 10 календарных дней с даты получения обоснованного требования тем же способом, которым прошла оплата. Если платёжный сервис это не позволяет, возврат идёт по реквизитам, которые сообщит Заказчик.`,
        },
      ],
    },
    {
      id: 'duties',
      title: '9. Обязанности сторон',
      blocks: [
        {
          type: 'p',
          text: 'Исполнитель оказывает услугу в соответствии с оплаченным тарифом и этой офертой, обеспечивает работу кабинета и рассматривает обращения Заказчика.',
        },
        {
          type: 'p',
          text: 'Заказчик:',
        },
        {
          type: 'list',
          items: [
            'проверяет Результат до публикации на площадке и сам отвечает за карточку, которую размещает;',
            'гарантирует, что имеет права на Материалы и что в них нет запрещённого законом контента;',
            'не загружает чужие персональные данные, изображения документов, сведения о здоровье, политических и религиозных взглядах и иные специальные категории, если это не нужно для законной съёмки товара и у него нет на это права;',
            'не использует Сервис для нарушения работы сайта, обхода ограничений тарифа и доступа к чужим кабинетам.',
          ],
        },
      ],
    },
    {
      id: 'rights',
      title: '10. Материалы и интеллектуальные права',
      blocks: [
        {
          type: 'p',
          text: 'Права на исходные Материалы остаются у Заказчика или иного правообладателя. Заказчик даёт Исполнителю безвозмездную лицензию обрабатывать Материалы только чтобы оказать заказанную услугу: хранить их в кабинете, передать в обработку и показать Результат самому Заказчику.',
        },
        {
          type: 'p',
          text: 'Исключительное право на программу, интерфейс, базы и товарный знак Сервиса принадлежит Исполнителю или его лицензиарам. Оферта не продаёт эти права. Заказчик использует Результат для своих карточек товаров и рекламы этих товаров. Исполнитель не обещает, что Результат будет единственным в мире: генерация может давать похожие приёмы у разных пользователей.',
        },
      ],
    },
    {
      id: 'liability',
      title: '11. Ответственность',
      blocks: [
        {
          type: 'p',
          text: 'Исполнитель отвечает за неоказание услуги и за недостатки по закону и этой оферте. Никакое условие не ограничивает ответственность за умысел, вред жизни и здоровью и не отменяет права потребителя, которые закон запрещает ограничивать.',
        },
        {
          type: 'p',
          text: 'Результат создаётся автоматически. Перед публикацией его нужно проверить: возможны ошибки фона, текста, пропорций и мелких деталей. Убытки из-за того, что Заказчик опубликовал непроверенный результат, Исполнитель возмещает только в пределах, в которых это допускает закон, и не возмещает упущенную выгоду заказчика, который не является потребителем.',
        },
        {
          type: 'p',
          text: 'Перерывы на обновление и сбои связи возможны. На время такого перерыва неизрасходованный лимит сохраняется. Если из-за сбоя операция не была оказана, действуют правила раздела 6.',
        },
      ],
    },
    {
      id: 'personal-data',
      title: '12. Персональные данные',
      blocks: [
        {
          type: 'p',
          text: `Обработку персональных данных регулирует отдельный документ — [Политика обработки персональных данных](/privacy). Принятие оферты само по себе не даёт согласия на обработку. Вопросы по данным можно направить на ${email}.`,
        },
      ],
    },
    {
      id: 'claims',
      title: '13. Претензии и споры',
      blocks: [
        {
          type: 'p',
          text: `До суда сторона направляет претензию на ${email} или по адресу Исполнителя. Исполнитель отвечает на претензию потребителя о возврате денег и об устранении недостатков в течение 10 календарных дней, на иные обращения — в срок, который установлен законом, а если срок не установлен — в течение 30 календарных дней.`,
        },
        {
          type: 'p',
          text: 'Спор с потребителем рассматривается судом по правилам подсудности Закона «О защите прав потребителей»: потребитель сам выбирает суд из вариантов, которые даёт закон. Оферта не назначает обязательный суд по месту нахождения Исполнителя для потребителя. Спор с заказчиком, который не является потребителем, после претензионного порядка рассматривается в суде по месту нахождения Исполнителя.',
        },
      ],
    },
    {
      id: 'changes',
      title: '14. Срок действия и изменение оферты',
      blocks: [
        {
          type: 'p',
          text: 'Оферта действует с момента публикации этой редакции. Исполнитель может заменить её, опубликовав новую редакцию на этой странице с новой датой. Новая редакция применяется к регистрациям и оплатам, которые совершены после публикации. Уже оплаченный тариф оказывается на условиях, которые действовали в момент его оплаты, кроме изменений, которые прямо требует закон.',
        },
        {
          type: 'p',
          text: `Исполнитель: ${name}, ИНН ${inn}, ОГРН ${ogrn}, адрес: ${address}, телефон ${phoneDisplay}, email ${email}. Те же сведения есть на страницах [«О компании»](/about) и [«Контакты»](/contacts) и в подвале сайта.`,
        },
      ],
    },
  ],
};

export const offerEn: LegalDoc = {
  title: 'Public offer',
  lead: 'Terms of the Card Genius AI service. This is an offer to enter into a contract with anyone who accepts it.',
  edition: `Version of ${LEGAL_EDITION.en}`,
  sections: [
    {
      id: 'general',
      title: '1. General',
      blocks: [
        {
          type: 'p',
          text: `This document is a public offer by ${name} (the Provider) under articles 435 and 437 of the Civil Code of the Russian Federation. It offers a paid-services contract (chapter 39 of the Civil Code) and, for a free plan, a contract for free use of that functionality.`,
        },
        {
          type: 'p',
          text: 'The service is intended for people aged 18 or older. The Provider does not knowingly collect children’s data. If you believe a child has sent us data, email the address in the company details and we will delete it unless the law requires us to keep it.',
        },
        {
          type: 'p',
          text: 'If the customer buys the service for personal, family or other non-business needs, they are a consumer. The Russian Consumer Protection Law applies. Any term that reduces a consumer’s statutory rights does not apply.',
        },
        {
          type: 'p',
          text: 'The offer, the service description on the site, and the plan cards with prices form one contract. The law of the Russian Federation applies.',
        },
      ],
    },
    {
      id: 'terms',
      title: '2. Definitions',
      blocks: [
        {
          type: 'list',
          items: [
            'Service — the Card Genius AI program on the Provider’s site: the account, image and product-card text processing, and result history.',
            'Customer — a person who has accepted the offer.',
            'Account — the private area available after registration with an email address and password.',
            'Plan — a set of features and a limit of tasks or downloads at the price published on the site at the time of payment.',
            'Materials — photos, names, descriptions and other information the Customer uploads or enters for processing.',
            'Result — images and texts the Service produced for the Customer’s task and showed in the account.',
          ],
        },
      ],
    },
    {
      id: 'service',
      title: '3. Subject of the contract',
      blocks: [
        {
          type: 'p',
          text: 'The Provider gives the Customer remote access to the Service and prepares product-card visuals and texts automatically. The operations available in the interface at launch may include background removal, background generation, exposure, image improvement, infographics and card copy.',
        },
        {
          type: 'p',
          text: 'The service is delivered electronically. There is no courier or postal delivery. After registration the Customer signs in to the account. After a successful payment the paid limit becomes available there. The Customer views and downloads the result in the account, and it remains in the account history.',
        },
        {
          type: 'p',
          text: 'The Service helps prepare materials for marketplaces. The Customer contracts with the marketplace separately. The Provider does not guarantee that a marketplace will accept a card and does not promise sales, views or conversion.',
        },
      ],
    },
    {
      id: 'acceptance',
      title: '4. Acceptance',
      blocks: [
        {
          type: 'p',
          text: 'The offer is accepted for registration and account access when the Customer checks the separate box accepting the offer on the registration form and submits the form (article 438 of the Civil Code). That part of the contract is concluded when the account is created.',
        },
        {
          type: 'p',
          text: 'The offer is accepted for a specific paid plan when that plan is paid. That contract is concluded when the successful payment is confirmed. A plan marked free on the site does not require payment: its limit is granted after registration.',
        },
        {
          type: 'note',
          text: 'Checking the offer box is not consent to personal-data processing. Consent is a separate action and is described in the [Personal data processing policy](/privacy), as required by part 1 of article 9 of Federal Law No. 152-FZ of 27 July 2006.',
        },
      ],
    },
    {
      id: 'account',
      title: '5. Registration and account',
      blocks: [
        {
          type: 'p',
          text: 'The account needs a working email address and a password. The Customer provides a real email and keeps control of the mailbox and password. Actions in the account after sign-in are treated as the Customer’s until the Customer reports unauthorized access.',
        },
        {
          type: 'p',
          text: 'One person uses one account in their own name. The account may not be transferred unless the parties agree otherwise in writing. The Provider may block access if the account is used to attack the Service, distribute malware or post prohibited material, and will email the Customer when that is possible.',
        },
      ],
    },
    {
      id: 'performance',
      title: '6. How the service is provided',
      blocks: [
        {
          type: 'list',
          items: [
            'The Customer chooses a plan on the site. Current prices and limits are published in the Pricing section.',
            'A paid plan is paid through the payment service. A free plan is not paid.',
            'The Provider enables the selected limit in the account: a number of tasks or downloads, as the plan card states.',
            'The Customer uploads a product photo, optionally enters a name and description, and starts processing.',
            'The result appears in the account. It can be viewed, edited with the tools in the interface, and downloaded. A copy stays in the history until the record is deleted.',
          ],
        },
        {
          type: 'p',
          text: 'An operation is rendered when the result is available in the account for viewing or download. If it fails for a reason on the Provider’s side and there is no result, it is not rendered: the limit for that operation is restored, or the Customer may claim a refund of the corresponding part of the price.',
        },
        {
          type: 'p',
          text: 'Performance starts immediately after registration, payment or a processing request, because the service is immediate electronic access. A limit does not expire on a hidden timer: it lasts until it is used, unless the plan card states another period.',
        },
      ],
    },
    {
      id: 'payment',
      title: '7. Price and payment',
      blocks: [
        {
          type: 'p',
          text: 'The price is in Russian rubles on the plan card at the moment of payment and includes charges that the law requires to be included in the consumer price. If VAT applies, it is shown on the cash receipt. A plan is not sold at an old price after the site price has changed: a new order uses the price shown before payment.',
        },
        {
          type: 'p',
          text: `Payments are taken by YooKassa (the payment operator is NBCO YooMoney LLC). The Customer enters the card number and security code on the payment service’s side. The Provider does not receive or store those card details. The Provider receives confirmation of the amount, status and payment identifier. Where Federal Law No. 54-FZ of 22 May 2003 requires it, a cash receipt is sent to the Customer’s email.`,
        },
        {
          type: 'p',
          text: 'A plan is paid when the successful payment is confirmed. If money was charged and access did not open, the Customer emails the Provider: access is opened or the money is returned.',
        },
      ],
    },
    {
      id: 'refund',
      title: '8. Cancellation and refunds',
      blocks: [
        {
          type: 'p',
          text: 'A consumer may cancel at any time, paying the Provider for the services actually rendered (article 32 of the Consumer Protection Law and article 782 of the Civil Code). A customer who is not a consumer may cancel on the same terms unless the law sets another procedure.',
        },
        {
          type: 'p',
          text: 'The price of the unrendered part is refunded: the unused limit and operations that were not rendered. The price of operations that were properly rendered and whose result the Customer received is not refunded. The Provider does not keep an extra “expenses” charge on top of that unless it can show the amount.',
        },
        {
          type: 'p',
          text: 'If a service is rendered with a defect, the consumer may choose free correction, a repeat rendering, a proportionate price reduction, or a refund of the defective part (article 29 of the Consumer Protection Law).',
        },
        {
          type: 'p',
          text: `The request is sent to ${email} from the account address. It should name the plan, payment date and amount, and what is requested. Money is returned within 10 calendar days of a justified request by the same payment method. If the payment service cannot do that, the refund is sent to details the Customer provides.`,
        },
      ],
    },
    {
      id: 'duties',
      title: '9. Duties',
      blocks: [
        {
          type: 'p',
          text: 'The Provider renders the service according to the paid plan and this offer, keeps the account available, and reviews the Customer’s requests.',
        },
        {
          type: 'p',
          text: 'The Customer:',
        },
        {
          type: 'list',
          items: [
            'checks the Result before publishing it and is responsible for the listing they publish;',
            'confirms they have rights to the Materials and that the Materials are not unlawful;',
            'does not upload other people’s personal data, images of identity documents, health data, political or religious views, or other special-category data unless a lawful product photo requires it and they have the right to use it;',
            'does not use the Service to disrupt the site, bypass plan limits, or access someone else’s account.',
          ],
        },
      ],
    },
    {
      id: 'rights',
      title: '10. Materials and intellectual property',
      blocks: [
        {
          type: 'p',
          text: 'Rights in the source Materials stay with the Customer or another right holder. The Customer gives the Provider a free licence to process the Materials only to render the ordered service: store them in the account, run processing, and show the Result to the Customer.',
        },
        {
          type: 'p',
          text: 'The exclusive right in the software, interface, databases and the Service’s marks belongs to the Provider or its licensors. This offer does not sell those rights. The Customer may use the Result for their product cards and advertising of those products. The Provider does not promise that a Result is unique: generation may use similar techniques for different users.',
        },
      ],
    },
    {
      id: 'liability',
      title: '11. Liability',
      blocks: [
        {
          type: 'p',
          text: 'The Provider is liable for failure to render the service and for defects under the law and this offer. No term limits liability for intent or for harm to life or health, and no term removes consumer rights that the law forbids limiting.',
        },
        {
          type: 'p',
          text: 'The Result is produced automatically. It must be checked before publication: background, text, proportions and small details may be wrong. Loss caused by publishing an unchecked Result is compensated only to the extent the law allows. Lost profit of a customer who is not a consumer is not compensated.',
        },
        {
          type: 'p',
          text: 'Maintenance and connection failures may happen. An unused limit remains during such a pause. If a failure means an operation was not rendered, section 6 applies.',
        },
      ],
    },
    {
      id: 'personal-data',
      title: '12. Personal data',
      blocks: [
        {
          type: 'p',
          text: `Personal data is governed by a separate document, the [Personal data processing policy](/privacy). Accepting this offer is not consent to processing. Questions about data can be sent to ${email}.`,
        },
      ],
    },
    {
      id: 'claims',
      title: '13. Claims and disputes',
      blocks: [
        {
          type: 'p',
          text: `Before going to court, a party sends a claim to ${email} or to the Provider’s address. The Provider answers a consumer’s claim for a refund or for correction of a defect within 10 calendar days, and answers other requests within the statutory period or, if none is set, within 30 calendar days.`,
        },
        {
          type: 'p',
          text: 'A dispute with a consumer is heard by the court under the jurisdiction rules of the Consumer Protection Law: the consumer chooses among the courts the law allows. This offer does not force a consumer to sue only at the Provider’s location. A dispute with a customer who is not a consumer, after the claim procedure, is heard by the court at the Provider’s location.',
        },
      ],
    },
    {
      id: 'changes',
      title: '14. Term and changes',
      blocks: [
        {
          type: 'p',
          text: 'This version applies from the moment it is published. The Provider may replace it by publishing a new version on this page with a new date. The new version applies to registrations and payments made after publication. A plan already paid for is rendered on the terms in force when it was paid, except for changes the law itself requires.',
        },
        {
          type: 'p',
          text: `Provider: ${name}, INN ${inn}, OGRN ${ogrn}, address: ${address}, phone ${phoneDisplay}, email ${email}. The same details are on the [About](/about) and [Contacts](/contacts) pages and in the site footer.`,
        },
      ],
    },
  ],
};
