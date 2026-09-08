const MEKKA_SZER = 51.440;
const MEKKA_DLUG = 5.4724;
const KOREKTA_KOMPASU = 0; 
const TŁUMACZENIA = {
    'en': {
        tytul_strony: "Kaaba Finder | Kompas",
        tytul: "Kompas do Kaaby",
        status_oczekujacy: "Oczekuję na lokalizację...",
        status_sukces: "Lokalizacja aktywna.",
        status_blad: "Błąd lokalizacji.",
        akt_lokalizacja: "Twoja pozycja:",
        etykieta_dystans: "Dystans do Kaaby:",
        kierunek_kaaby: "Azymut (od N):",
        info_przycisk: "ZEZWÓL NA KOMPAS",
        info_aktywny: "Kompas aktywny. Celuj w Kaabę.",
        info_czekaj: "Kalibrowanie...",
        stopnie: "°",
        km: " km"
    },
    'pl': {
        tytul_strony: "Philipsmaxxxxing",
        tytul: "where is the Gerard?",
        status_oczekujacy: "checking the location...",
        status_sukces: "location is configured.",
        status_blad: "location error.",
        akt_lokalizacja: "your location:",
        etykieta_dystans: "distance to Philips:",
        kierunek_kaaby: "degree to Philips (from N):",
        info_przycisk: "allow access to compass",
        info_aktywny: "Compass is active. Aim at the Gerard.",
        info_czekaj: "Calibrating...",
        stopnie: "°",
        km: " km"
    },
    'es': {
        tytul_strony: "Brújula de la Kaaba",
        tytul: "Dirección de la Kaaba",
        status_oczekujacy: "Obteniendo ubicación...",
        status_sukces: "Ubicación obtenida.",
        status_blad: "Error de ubicación.",
        akt_lokalizacja: "Tu ubicación:",
        etykieta_dystans: "Distancia a la Kaaba:",
        kierunek_kaaby: "Ángulo a la Kaaba:",
        info_przycisk: "Activar brújula",
        info_aktywny: "Brújula activa.",
        info_czekaj: "Calibrando...",
        stopnie: "°",
        km: " km"
    },
    'tr': {
        tytul_strony: "Kabe Pusulası",
        tytul: "Kabe Yönü",
        status_oczekujacy: "Konum bekleniyor...",
        status_sukces: "Konum alındı.",
        status_blad: "Konum hatası.",
        akt_lokalizacja: "Konumunuz:",
        etykieta_dystans: "Kabe Mesafesi:",
        kierunek_kaaby: "Kabe Açısı:",
        info_przycisk: "PUSULAYI AÇ",
        info_aktywny: "Pusula aktif.",
        info_czekaj: "Yükleniyor...",
        stopnie: "°",
        km: " km"
    },
    'ar': {
        tytul_strony: "بوصلة الكعبة",
        tytul: "اتجاه القبلة",
        status_oczekujacy: "...جاري تحديد الموقع",
        status_sukces: "تم تحديد الموقع.",
        status_blad: "خطأ في الموقع.",
        akt_lokalizacja: "موقعك:",
        etykieta_dystans: "المسافة للكعبة:",
        kierunek_kaaby: "زاوية القبلة:",
        info_przycisk: "تفعيل البوصلة",
        info_aktywny: "البوصلة نشطة.",
        info_czekaj: "...جار التحميل",
        stopnie: "°",
        km: " كم"
    }
};

const elJezyk = document.getElementById('wybor-jezyka');
const elStatus = document.getElementById('status');
const elLokalizacja = document.getElementById('dane-lokalizacji');
const elDystans = document.getElementById('dane-dystansu');
const elEtykietaDystans = document.getElementById('etykieta-dystans');
const elKat = document.getElementById('kat-kaaby');
const elKompas = document.getElementById('kompas');
const elIgla = document.getElementById('igla-kaaba');
const elInfo = document.getElementById('info-orientacja');
const elTytul = document.getElementById('tytul');
const elTytulStrony = document.getElementById('tytul-strony');
const elLabelLok = document.getElementById('akt-lokalizacja');
const elLabelKier = document.getElementById('kierunek-kaaby');
const body = document.body;

let kierunekKaaby = null; 
let aktualnyJezyk = 'pl';
let calkowityObrot = 0;
let poprzedniKierunekTelefonu = 0;

const naRadiany = (deg) => deg * (Math.PI / 180);
const naStopnie = (rad) => rad * (180 / Math.PI);

function obliczDystans(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = naRadiany(lat2 - lat1);
    const dLon = naRadiany(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(naRadiany(lat1)) * Math.cos(naRadiany(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(0);
}

function przeliczDaneGeograficzne(szer, dlug) {
    const szerM = naRadiany(MEKKA_SZER);
    const dlugM = naRadiany(MEKKA_DLUG);
    const szerU = naRadiany(szer);
    const dlugU = naRadiany(dlug); 
    const deltaL = dlugM - dlugU;
    const y = Math.sin(deltaL);
    const x = Math.cos(szerU) * Math.tan(szerM) - Math.sin(szerU) * Math.cos(deltaL);

    let azymut = naStopnie(Math.atan2(y, x));
    if (azymut < 0) azymut += 360;
    
    kierunekKaaby = azymut;

    const dystans = obliczDystans(szer, dlug, MEKKA_SZER, MEKKA_DLUG);
    
    const t = TŁUMACZENIA[aktualnyJezyk];
    elKat.textContent = `${kierunekKaaby.toFixed(1)}${t.stopnie}`;
    elDystans.textContent = `${dystans}${t.km}`;
    
    elIgla.style.transform = `translateX(-50%) rotate(${kierunekKaaby}deg)`;
}

function zmienJezyk(kod) {
    aktualnyJezyk = kod;
    const t = TŁUMACZENIA[kod];
    
    elTytulStrony.textContent = t.tytul_strony;
    elTytul.textContent = t.tytul;
    elLabelLok.textContent = t.akt_lokalizacja;
    elEtykietaDystans.textContent = t.etykieta_dystans;
    elLabelKier.textContent = t.kierunek_kaaby;
    
    if (elStatus.classList.contains('status-oczekujaca')) elStatus.textContent = t.status_oczekujacy;
    if (elStatus.classList.contains('status-sukces')) elStatus.textContent = t.status_sukces;
    if (elStatus.classList.contains('status-blad')) elStatus.textContent = t.status_blad;
    
    if (kod === 'ar') body.classList.add('rtl');
    else body.classList.remove('rtl');
    
    if (kierunekKaaby !== null) {}
}

elJezyk.addEventListener('change', (e) => zmienJezyk(e.target.value));

function startGPS() {
    const t = TŁUMACZENIA[aktualnyJezyk];
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                
                elStatus.textContent = t.status_sukces;
                elStatus.className = 'wiadomosc status-sukces';
                elLokalizacja.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                
                przeliczDaneGeograficzne(lat, lon);
                startKompas();
            },
            (err) => {
                elStatus.textContent = `${t.status_blad} (${err.code})`;
                elStatus.className = 'wiadomosc status-blad';
                startKompas(); 
            },
            { enableHighAccuracy: true }
        );
    } else elStatus.textContent = "Brak GPS.";
}

let lookingcounter = 0;

function obslugaOrientacji(e) {
    if (kierunekKaaby === null) return;
    
    let heading = 0;
    
    if (e.webkitCompassHeading) heading = e.webkitCompassHeading;
    else if (e.alpha !== null) heading = 360 - e.alpha; 
    
    heading = (heading + KOREKTA_KOMPASU + 360) % 360;

    let delta = heading - poprzedniKierunekTelefonu;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    
    calkowityObrot += delta;
    poprzedniKierunekTelefonu = heading;
    
    elKompas.style.transform = `rotate(${-calkowityObrot}deg)`;
    
    let cleanHeading = (heading + 360) % 360;
    let roznica = Math.abs(kierunekKaaby - cleanHeading);
    if (roznica > 180) roznica = 360 - roznica;
    
    if (roznica < 3) {
        lookingcounter++;
        console.log("lookingcounter: " + lookingcounter);
        if (!elKompas.classList.contains('cel-namierzony')) {
            elKompas.classList.add('cel-namierzony');
            if (navigator.vibrate) navigator.vibrate(50);
        }
    } else elKompas.classList.remove('cel-namierzony');
//triger gif when the phone is pointing to the statue,
//  count time when pointed, when reached 5 seconds, 
// show an random image from library and confetti for 1 second and text screenshot now!!!!!!
    lookingcounter = 0;

    elInfo.textContent = TŁUMACZENIA[aktualnyJezyk].info_aktywny;
    elInfo.classList.remove('status-oczekujaca');
}

setinterval(() => { 
  
  

  if(lookingcounter >= 5000){
    console.log("SUCCESSSS");

    function myFunction() {
  myDisplayer("SCREENSHOT NOW");
}

// Function to display any text
function myDisplayer(text) {
  let demo = document.getElementById("demo"); 
  demo.innerHTML += text + "<br>";
}

    //heres success
    

  }
}, 1000);

function startKompas() {
    const t = TŁUMACZENIA[aktualnyJezyk];
    
    wlaczBlokadeEkranu();

    const uruchomEventy = () => {
        if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', obslugaOrientacji, true);
        else window.addEventListener('deviceorientation', obslugaOrientacji, true);
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        
        elInfo.textContent = t.info_przycisk;
        const btn = document.createElement('button');
        btn.textContent = t.info_przycisk;
        btn.className = 'przycisk-przyznaj';
        elInfo.parentNode.insertBefore(btn, elInfo.nextSibling);
        
        btn.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission().then(resp => {
                if (resp === 'granted') {
                    uruchomEventy();
                    btn.remove();
                } else alert('Brak zgody na kompas');
            });
        });
    } else uruchomEventy();
}

async function wlaczBlokadeEkranu() {
    try {
        if ('wakeLock' in navigator) {
            await navigator.wakeLock.request('screen');
            console.log("Wake Lock aktywny - ekran nie zgaśnie.");
        }
    } catch (err) {
        console.log("Błąd Wake Lock:", err);
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        wlaczBlokadeEkranu();
    }
});

zmienJezyk('pl');
startGPS();

const confettiContainer = document.querySelector("#confetti-container");
const showConfetti = () => {
	const confetti = document.createElement("div");
	confetti.textContent = "🎉";
	confetti.classList.add("confetti");
	confetti.style.left = Math.random() * innerWidth + "px";
	confettiContainer.appendChild(confetti);

	setTimeout(() => {
		confetti.remove();
	}, 5000);
};

setInterval(() => {
	showConfetti();
}, 400);


// Call a Timeout
setTimeout(myFunction, 3000000);

// The callback function
function myFunction() {
  myDisplayer("SCREENSHOT NOW");
}

// Function to display any text
function myDisplayer(text) {
  let demo = document.getElementById("demo"); 
  demo.innerHTML += text + "<br>";
}

// Call a Timeout
setTimeout(randomImg1, 3000000);
let areyoulooking = false;



function randomImg1() {
      var myImages1 = new Array ();
      myImages1[1] = "philip/67.png";
      myImages1[2] = "philip/artist.png";
      myImages1[3] = "philip/base.png";
      var rnd = Math.floor( Math.random() * myImages1.length );
      if( rnd == 0 ) {
        rnd =1;
      }
      html_code = '<img class="who" src="' + myImages1[rnd] + '" />';
      document.write(html_code); 
    
}


  
