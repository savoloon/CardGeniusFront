import { COMPANY } from '../../constants/company';
import { LEGAL_EDITION } from './meta';
import type { LegalDoc } from './types';

const { name, inn, ogrn, address, email, phoneDisplay } = COMPANY;

export const privacyRu: LegalDoc = {
  title: 'Политика обработки персональных данных',
  lead: 'Документ оператора о том, какие данные пользователей обрабатывает Card Genius AI, зачем, как долго и как их защищает.',
  edition: `Редакция от ${LEGAL_EDITION.ru}`,
  sections: [
    {
      id: 'general',
      title: '1. Общие положения',
      blocks: [
        {
          type: 'p',
          text: `Эта политика принята ${name} (далее — Оператор) и определяет порядок обработки персональных данных пользователей сайта и сервиса Card Genius AI. Она опубликована, чтобы любой человек мог с ней ознакомиться до того, как передаст данные (часть 2 статьи 18.1 Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных»).`,
        },
        {
          type: 'p',
          text: 'Политика не заменяет отдельное согласие и не является офертой. Условия услуги изложены в [публичной оферте](/offer). Согласие, где оно нужно, оформляется отдельным действием — отметкой в форме регистрации, а не пунктом договора.',
        },
        {
          type: 'p',
          text: 'Оператор обрабатывает данные на законной и справедливой основе, только для заранее определённых целей и в объёме, который для этих целей нужен. Совместимые с целью действия не превращаются в новую скрытую цель.',
        },
      ],
    },
    {
      id: 'operator',
      title: '2. Оператор',
      blocks: [
        {
          type: 'p',
          text: `Оператор: ${name}, ИНН ${inn}, ОГРН ${ogrn}, адрес: ${address}. Телефон: ${phoneDisplay}. Email для обращений субъекта: ${email}.`,
        },
        {
          type: 'p',
          text: 'Ответственным за организацию обработки персональных данных является лицо, назначенное приказом Оператора. Обращение на указанный email считается обращением к Оператору и передаётся этому лицу. Сведения об Операторе также размещены на страницах [«О компании»](/about) и [«Контакты»](/contacts).',
        },
      ],
    },
    {
      id: 'bases',
      title: '3. Правовые основания',
      blocks: [
        {
          type: 'p',
          text: 'Оператор обрабатывает персональные данные только при наличии основания из части 1 статьи 6 Федерального закона № 152-ФЗ:',
        },
        {
          type: 'list',
          items: [
            'согласие субъекта (пункт 1), когда обработка не нужна для договора или закона. Согласие даётся отдельно от оферты, его можно отозвать;',
            'исполнение закона (пункт 2): бухгалтерский и налоговый учёт, кассовый чек в случаях, предусмотренных Федеральным законом от 22.05.2003 № 54-ФЗ;',
            'заключение и исполнение договора, стороной которого является субъект (пункт 5): регистрация кабинета, оказание услуги, история результатов, рассмотрение претензии.',
          ],
        },
        {
          type: 'p',
          text: 'Оператор не обрабатывает специальные категории персональных данных (статья 10) и не использует фотографии для установления личности человека (биометрические персональные данные в смысле статьи 11). Паспорт, СНИЛС, телефон пользователя и платёжная карта для работы сервиса не запрашиваются.',
        },
      ],
    },
    {
      id: 'purposes',
      title: '4. Цели, субъекты и состав данных',
      blocks: [
        {
          type: 'p',
          text: 'Субъекты: посетители сайта, пользователи с учётной записью и лица, которые написали Оператору. По каждой цели обрабатывается свой перечень.',
        },
        {
          type: 'list',
          items: [
            'Регистрация и вход в кабинет. Данные: адрес электронной почты, хэш пароля (сам пароль в открытом виде не хранится), идентификатор учётной записи, дата регистрации, служебные cookie доступа. Основание: договор и отдельное согласие на email, IP-адрес и cookie, которое даётся в форме регистрации.',
            'Оказание услуги. Данные: загруженные изображения, название и описание товара, если пользователь их ввёл, режим обработки, статус, дата и идентификатор задания, результат в истории кабинета. Основание: договор. Изображение обрабатывается, чтобы подготовить карточку товара, а не чтобы оценить человека.',
            'Оплата тарифа. Данные: email, выбранный тариф, сумма, дата, статус и идентификатор платежа. Номер карты и CVV Оператор не получает. Основание: договор и закон о применении контрольно-кассовой техники.',
            'Ответы на обращения, претензии и запросы по персональным данным. Данные: email, содержание письма и сведения, которые человек сам приложил. Основание: договор, согласие или закон — в зависимости от предмета обращения.',
            'Защита формы регистрации от автоматических запросов. Данные: IP-адрес и токен проверки Yandex SmartCaptcha. Основание: согласие, данное при регистрации, и необходимость заключить договор по инициативе пользователя.',
          ],
        },
        {
          type: 'p',
          text: 'Автоматическая обработка создаёт изображение или текст по заданию пользователя. Она не порождает юридически значимого решения о человеке и не ограничивает его права (статья 16 Федерального закона № 152-ФЗ).',
        },
      ],
    },
    {
      id: 'actions',
      title: '5. Действия и способы',
      blocks: [
        {
          type: 'p',
          text: 'Оператор совершает с данными сбор, запись, систематизацию, накопление, хранение, уточнение, извлечение, использование, передачу в случаях из раздела 7, блокирование, удаление и уничтожение. Обработка смешанная: в информационных системах и, если обращение пришло на бумаге, на бумажном носителе. Без средств автоматизации обрабатываются только письма и претензии, которые так поступили.',
        },
        {
          type: 'p',
          text: 'Данные поступают от самого субъекта: из формы регистрации, кабинета, платёжного подтверждения и писем. Оператор не покупает базы и не собирает данные из чужих профилей.',
        },
      ],
    },
    {
      id: 'cookies',
      title: '6. Cookie и локальное хранилище',
      blocks: [
        {
          type: 'p',
          text: 'Сервис использует только данные, без которых он не работает или без которых нельзя запомнить выбор самого пользователя:',
        },
        {
          type: 'list',
          items: [
            'cookie сессии: признаки входа. Они нужны, чтобы кабинет открывался без повторного пароля на каждом запросе. Срок короткой сессии — до 30 минут, признак продления входа — до 7 дней. Cookie недоступны скриптам страницы;',
            'локальное хранилище браузера: выбранные язык и тема оформления, а также черновик работы в кабинете на этом устройстве. Эти сведения не передаются рекламным сетям.',
          ],
        },
        {
          type: 'p',
          text: 'Сторонние счётчики аналитики и рекламные cookie Оператор не подключает. Отключить cookie сессии можно в браузере, но тогда вход в кабинет работать не будет.',
        },
      ],
    },
    {
      id: 'parties',
      title: '7. Кому передаются данные',
      blocks: [
        {
          type: 'p',
          text: 'Оператор не продаёт персональные данные и не передаёт их для чужой рекламы. Передача ограничена такими получателями:',
        },
        {
          type: 'list',
          items: [
            'ООО НКО «ЮМани» (сервис ЮKassa) — чтобы принять оплату. Карточные данные человек вводит на стороне этого оператора. Оператору сервиса возвращаются статус, сумма и идентификатор платежа.',
            'Сервис Yandex SmartCaptcha (проверка запроса на smartcaptcha.yandexcloud.net) — только IP-адрес и токен капчи, чтобы отличить человека от автоматического запроса при регистрации.',
            'Лица, которые обрабатывают данные по поручению Оператора на основании договора (хостинг и сопровождение), если такие лица привлекаются. Поручение не разрешает использовать данные в своих целях. Оператор отвечает перед субъектом за действия по поручению.',
            'Государственный орган — только когда обязанность передач прямо следует из закона или из обязательного запроса.',
          ],
        },
      ],
    },
    {
      id: 'localization',
      title: '8. Локализация и трансграничная передача',
      blocks: [
        {
          type: 'p',
          text: 'Запись, систематизация, накопление, хранение, уточнение и извлечение персональных данных граждан Российской Федерации ведутся с использованием баз данных на территории Российской Федерации (часть 5 статьи 18 Федерального закона № 152-ФЗ).',
        },
        {
          type: 'p',
          text: 'Трансграничная передача Оператором не осуществляется. Если она станет нужна для работы сервиса, Оператор выполнит статью 12 Федерального закона № 152-ФЗ до начала передачи и дополнит эту политику.',
        },
      ],
    },
    {
      id: 'retention',
      title: '9. Сроки, прекращение и уничтожение',
      blocks: [
        {
          type: 'list',
          items: [
            'Данные учётной записи, материалы и история — пока существует кабинет и цель обработки не достигнута. По запросу на удаление кабинета или отдельной записи Оператор удаляет их, если закон не требует хранить конкретный документ.',
            'Сведения о платеже, которые относятся к бухгалтерскому и налоговому учёту, — в срок, установленный законодательством о бухгалтерском учёте и налогах, не менее пяти лет.',
            'Переписка по претензии — до истечения срока, в который можно заявить требование по этому обращению, и дольше, только если документ нужно хранить по закону.',
            'IP-адрес и токен капчи — на время проверки запроса. Отдельная база таких адресов для других целей не ведётся.',
            'Cookie входа — не дольше сроков, указанных в разделе 6.',
          ],
        },
        {
          type: 'p',
          text: 'Когда цель достигнута, согласие отозвано или поступило законное требование прекратить обработку, Оператор прекращает обработку и уничтожает данные либо обезличивает их, если нет другого основания из пунктов 2–11 части 1 статьи 6, части 2 статьи 10 или части 2 статьи 11 Федерального закона № 152-ФЗ. Уничтожение подтверждается внутренним актом, когда закон или локальный порядок Оператора этого требует.',
        },
      ],
    },
    {
      id: 'security',
      title: '10. Меры защиты',
      blocks: [
        {
          type: 'p',
          text: 'Оператор принимает правовые, организационные и технические меры, которые требуют статьи 18.1 и 19 Федерального закона № 152-ФЗ, в объёме, соответствующем угрозам для этого сервиса:',
        },
        {
          type: 'list',
          items: [
            'назначено лицо, ответственное за организацию обработки;',
            'эта политика опубликована, доступ к кабинету есть только у владельца учётной записи;',
            'пароль хранится в виде криптографического хэша, а не открытым текстом;',
            'признаки входа передаются в cookie, которые недоступны скриптам страницы, а в продуктивной среде сайт работает по защищённому соединению HTTPS;',
            'число попыток входа ограничивается;',
            'доступ работников и подрядчиков даётся только в объёме, нужном для их задачи.',
          ],
        },
        {
          type: 'p',
          text: 'Абсолютной защиты не существует. Если Оператор узнает об утечке, он уведомит уполномоченный орган и субъектов в случаях и сроки, которые установлены законом.',
        },
      ],
    },
    {
      id: 'rights',
      title: '11. Права субъекта и обращения',
      blocks: [
        {
          type: 'p',
          text: 'Субъект вправе получить сведения об обработке своих данных, требовать уточнения, блокирования или уничтожения, если данные неполные, устаревшие, неточные или обрабатываются незаконно, отозвать согласие и обжаловать действия Оператора в Роскомнадзор или в суд (статьи 14, 17 и 21 Федерального закона № 152-ФЗ).',
        },
        {
          type: 'p',
          text: `Запрос направляется на ${email} с того адреса, который указан в кабинете, либо с приложением сведений, по которым можно понять, что пишет именно субъект или его представитель. В запросе нужны суть требования и, если нужно, какие сведения исправить или удалить. Представитель прилагает подтверждение полномочий.`,
        },
        {
          type: 'p',
          text: 'Оператор отвечает на запрос о персональных данных в течение 10 рабочих дней. Этот срок может быть продлён не более чем на 5 рабочих дней с уведомлением заявителя, если закон допускает такое продление. Отозвать согласие можно тем же письмом. После отзыва обработка, которая опиралась только на согласие, прекращается. Обработка, которая нужна для уже заключённого договора или для бухгалтерского учёта, может быть продолжена по этим основаниям, о чём Оператор сообщает в ответе.',
        },
        {
          type: 'p',
          text: 'Реализация прав бесплатна. Оператор не ставит условием доступа к сведениям покупку тарифа и не отказывает в ответе только потому, что человек не назвал внутренний номер заявки.',
        },
      ],
    },
    {
      id: 'changes',
      title: '12. Изменение политики',
      blocks: [
        {
          type: 'p',
          text: 'Новая редакция публикуется на этой странице с новой датой и применяется к обработке с момента публикации. Если для уже собираемых данных потребуется новое согласие, Оператор запросит его отдельно и не будет считать молчание согласием.',
        },
        {
          type: 'p',
          text: `Действующая редакция: ${LEGAL_EDITION.ru}. Контакт для запросов: ${email}, телефон ${phoneDisplay}.`,
        },
      ],
    },
  ],
};

export const privacyEn: LegalDoc = {
  title: 'Personal data processing policy',
  lead: 'The operator’s document on what Card Genius AI processes about users, why, for how long, and how it is protected.',
  edition: `Version of ${LEGAL_EDITION.en}`,
  sections: [
    {
      id: 'general',
      title: '1. General',
      blocks: [
        {
          type: 'p',
          text: `This policy is adopted by ${name} (the Operator) and sets out how personal data of users of the Card Genius AI site and service is processed. It is published so that anyone can read it before providing data (part 2 of article 18.1 of Federal Law No. 152-FZ of 27 July 2006 “On Personal Data”).`,
        },
        {
          type: 'p',
          text: 'The policy does not replace separate consent and is not an offer. The service terms are in the [public offer](/offer). Where consent is required, it is a separate action — a checkbox on the registration form — not a clause of the contract.',
        },
        {
          type: 'p',
          text: 'The Operator processes data lawfully and fairly, only for defined purposes and only in the volume those purposes need.',
        },
      ],
    },
    {
      id: 'operator',
      title: '2. Operator',
      blocks: [
        {
          type: 'p',
          text: `Operator: ${name}, INN ${inn}, OGRN ${ogrn}, address: ${address}. Phone: ${phoneDisplay}. Email for data-subject requests: ${email}.`,
        },
        {
          type: 'p',
          text: 'The person responsible for organizing personal-data processing is appointed by the Operator’s order. An email to the address above is a request to the Operator and is passed to that person. The same details are on the [About](/about) and [Contacts](/contacts) pages.',
        },
      ],
    },
    {
      id: 'bases',
      title: '3. Legal bases',
      blocks: [
        {
          type: 'p',
          text: 'The Operator processes personal data only on a basis in part 1 of article 6 of Federal Law No. 152-FZ:',
        },
        {
          type: 'list',
          items: [
            'the subject’s consent (item 1), where processing is not required by the contract or by law. Consent is separate from the offer and can be withdrawn;',
            'a legal duty (item 2): accounting and tax records, and a cash receipt where Federal Law No. 54-FZ of 22 May 2003 requires one;',
            'entering into and performing a contract to which the subject is a party (item 5): account registration, rendering the service, result history, and handling a claim.',
          ],
        },
        {
          type: 'p',
          text: 'The Operator does not process special categories of personal data (article 10) and does not use photographs to identify a person (biometric personal data within article 11). A passport, insurance number, the user’s phone number and payment card are not requested for the service.',
        },
      ],
    },
    {
      id: 'purposes',
      title: '4. Purposes, subjects and data',
      blocks: [
        {
          type: 'p',
          text: 'Subjects are site visitors, registered users, and people who write to the Operator. Each purpose has its own list.',
        },
        {
          type: 'list',
          items: [
            'Registration and sign-in. Data: email address, password hash (the password is not stored in clear text), account id, registration date, and session cookies. Basis: the contract and the separate consent to the email, IP address and cookies given on the registration form.',
            'Rendering the service. Data: uploaded images, the product name and description if the user entered them, processing mode, status, date and task id, and the result in the account history. Basis: the contract. An image is processed to prepare a product card, not to evaluate a person.',
            'Paying for a plan. Data: email, selected plan, amount, date, status and payment id. The Operator does not receive the card number or CVV. Basis: the contract and cash-register law.',
            'Replies to messages, claims and personal-data requests. Data: email, the text of the message and whatever the person attached. Basis: the contract, consent or the law, depending on the request.',
            'Protecting the registration form from automated requests. Data: IP address and the Yandex SmartCaptcha token. Basis: the consent given at registration and the need to enter into a contract at the user’s initiative.',
          ],
        },
        {
          type: 'p',
          text: 'Automated processing produces an image or text for the user’s task. It does not produce a legal decision about a person and does not limit their rights (article 16 of Federal Law No. 152-FZ).',
        },
      ],
    },
    {
      id: 'actions',
      title: '5. Operations and methods',
      blocks: [
        {
          type: 'p',
          text: 'The Operator collects, records, organizes, stores, updates, retrieves, uses, transfers in the cases in section 7, blocks, deletes and destroys data. Processing is mixed: in information systems and, if a letter arrives on paper, on paper. Only letters and claims that arrive that way are processed without automation.',
        },
        {
          type: 'p',
          text: 'Data comes from the subject: the registration form, the account, payment confirmation and emails. The Operator does not buy databases or collect data from other people’s profiles.',
        },
      ],
    },
    {
      id: 'cookies',
      title: '6. Cookies and local storage',
      blocks: [
        {
          type: 'p',
          text: 'The Service uses only data it needs in order to work, or to remember a choice the user made:',
        },
        {
          type: 'list',
          items: [
            'session cookies, so the account stays signed in. The short session lasts up to 30 minutes; the sign-in extension lasts up to 7 days. These cookies are not readable by page scripts;',
            'the browser’s local storage: the chosen language and theme, and a draft of work in the account on that device. This is not sent to advertising networks.',
          ],
        },
        {
          type: 'p',
          text: 'The Operator does not connect third-party analytics or advertising cookies. Session cookies can be blocked in the browser, but then sign-in will not work.',
        },
      ],
    },
    {
      id: 'parties',
      title: '7. Recipients',
      blocks: [
        {
          type: 'p',
          text: 'The Operator does not sell personal data and does not pass it on for someone else’s advertising. Recipients are limited to:',
        },
        {
          type: 'list',
          items: [
            'NBCO YooMoney LLC (YooKassa), to take payment. Card details are entered on that operator’s side. The Service receives the status, amount and payment id.',
            'Yandex SmartCaptcha (the check at smartcaptcha.yandexcloud.net): only the IP address and captcha token, to tell a person from an automated registration request.',
            'Persons who process data on the Operator’s instructions under a contract (hosting and maintenance), if any are engaged. The instruction does not allow them to use the data for their own purposes. The Operator remains responsible to the subject for that processing.',
            'A public authority, only where a statute or a binding request requires the transfer.',
          ],
        },
      ],
    },
    {
      id: 'localization',
      title: '8. Localization and cross-border transfer',
      blocks: [
        {
          type: 'p',
          text: 'Recording, organization, accumulation, storage, updating and retrieval of personal data of citizens of the Russian Federation are carried out using databases located in the Russian Federation (part 5 of article 18 of Federal Law No. 152-FZ).',
        },
        {
          type: 'p',
          text: 'The Operator does not transfer personal data across borders. If that becomes necessary for the service, the Operator will comply with article 12 of Federal Law No. 152-FZ before the transfer and will update this policy.',
        },
      ],
    },
    {
      id: 'retention',
      title: '9. Periods, cessation and destruction',
      blocks: [
        {
          type: 'list',
          items: [
            'Account data, materials and history — while the account exists and the purpose is not fulfilled. On a request to delete the account or a record, the Operator deletes it unless the law requires that particular document to be kept.',
            'Payment information that belongs to accounting and tax records — for the period set by accounting and tax law, at least five years.',
            'Correspondence about a claim — until the time for bringing a claim on that matter has passed, and longer only if the law requires the document to be kept.',
            'The IP address and captcha token — for the time of the check. No separate database of those addresses is kept for other purposes.',
            'Sign-in cookies — no longer than the periods in section 6.',
          ],
        },
        {
          type: 'p',
          text: 'When the purpose is achieved, consent is withdrawn, or a lawful request to stop processing arrives, the Operator stops processing and destroys or anonymizes the data, unless another basis in items 2–11 of part 1 of article 6, part 2 of article 10 or part 2 of article 11 of Federal Law No. 152-FZ remains. Destruction is recorded in an internal act where the law or the Operator’s internal procedure requires it.',
        },
      ],
    },
    {
      id: 'security',
      title: '10. Safeguards',
      blocks: [
        {
          type: 'p',
          text: 'The Operator takes the legal, organizational and technical measures required by articles 18.1 and 19 of Federal Law No. 152-FZ, in line with the risks of this service:',
        },
        {
          type: 'list',
          items: [
            'a person responsible for organizing processing is appointed;',
            'this policy is published, and the account is available only to its holder;',
            'the password is stored as a cryptographic hash, not as clear text;',
            'sign-in tokens are sent in cookies that page scripts cannot read, and in production the site is served over HTTPS;',
            'the number of sign-in attempts is limited;',
            'staff and contractors receive access only to the extent their task requires.',
          ],
        },
        {
          type: 'p',
          text: 'No safeguard is absolute. If the Operator learns of a leak, it will notify the competent authority and the subjects in the cases and within the time the law sets.',
        },
      ],
    },
    {
      id: 'rights',
      title: '11. The subject’s rights and requests',
      blocks: [
        {
          type: 'p',
          text: 'The subject may obtain information about the processing of their data, require correction, blocking or destruction if the data are incomplete, outdated, inaccurate or processed unlawfully, withdraw consent, and complain about the Operator to Roskomnadzor or to a court (articles 14, 17 and 21 of Federal Law No. 152-FZ).',
        },
        {
          type: 'p',
          text: `A request is sent to ${email} from the address on the account, or with information showing that the writer is the subject or their representative. The request should state what is asked and, if relevant, what to correct or delete. A representative attaches proof of authority.`,
        },
        {
          type: 'p',
          text: 'The Operator answers a personal-data request within 10 business days. The period may be extended by no more than 5 business days with notice to the applicant, where the law allows the extension. Consent can be withdrawn by the same email. Processing that rested only on consent then stops. Processing required by a contract already made, or by accounting rules, may continue on that basis, and the Operator says so in the reply.',
        },
        {
          type: 'p',
          text: 'Exercising these rights is free. The Operator does not condition access to the information on buying a plan and does not refuse a reply only because the person did not quote an internal ticket number.',
        },
      ],
    },
    {
      id: 'changes',
      title: '12. Changes',
      blocks: [
        {
          type: 'p',
          text: 'A new version is published on this page with a new date and applies to processing from publication. If data already being collected needs new consent, the Operator will ask for it separately and will not treat silence as consent.',
        },
        {
          type: 'p',
          text: `Current version: ${LEGAL_EDITION.en}. Contact for requests: ${email}, phone ${phoneDisplay}.`,
        },
      ],
    },
  ],
};
