const radios = document.querySelectorAll("input[name='clase']");
const octetos = [o1, o2, o3, o4];
let claseSeleccionada = "";
let ipValidada = false;

const rangos = {
  A: { min: 0, max: 127, inicial: "0.0.0.0", final: "127.255.255.255", mascara: "255.0.0.0" },
  B: { min: 128, max: 191, inicial: "128.0.0.0", final: "191.255.255.255", mascara: "255.255.0.0" },
  C: { min: 192, max: 223, inicial: "192.0.0.0", final: "223.255.255.255", mascara: "255.255.255.0" }
};

function mostrarMensaje(texto) {
  toast.textContent = texto;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

function soloNumeros(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, input.maxLength || 3);
  });
}

[...octetos, cantidad].forEach(soloNumeros);

function limpiarResultados() {
  listaNumero.value = "";
  listaDireccion.value = "";
  listaMascara.value = "";
  listaPrimera.value = "";
  listaUltima.value = "";
  listaBroadcast.value = "";
  listaPuerta.value = "";
}

radios.forEach(radio => {
  radio.addEventListener("change", () => {
    claseSeleccionada = radio.value;
    ipValidada = false;

    const clase = rangos[claseSeleccionada];

    rangoInicial.value = clase.inicial;
    rangoFinal.value = clase.final;

    octetos.forEach(input => {
      input.disabled = false;
      input.value = "";
    });

    cantidad.value = "";
    cantidad.disabled = true;
    validar.disabled = false;
    generar.disabled = true;
    borrar.disabled = false;

    limpiarResultados();
    mostrarMensaje(`Clase ${claseSeleccionada} lista. Ahora escribe la dirección IP.`);
    o1.focus();
  });
});

validar.addEventListener("click", () => {
  if (!claseSeleccionada) {
    mostrarMensaje("Primero elige una clase de IP.");
    return;
  }

  const valores = octetos.map(input => input.value.trim());

  for (let i = 0; i < valores.length; i++) {
    if (valores[i] === "") {
      mostrarMensaje(`Falta completar el octeto ${i + 1}.`);
      octetos[i].focus();
      return;
    }

    const numero = Number(valores[i]);
    if (numero < 0 || numero > 255) {
      mostrarMensaje(`El octeto ${i + 1} debe estar entre 0 y 255.`);
      octetos[i].value = "";
      octetos[i].focus();
      return;
    }
  }

  const nums = valores.map(Number);
  const clase = rangos[claseSeleccionada];

  if (nums[0] < clase.min || nums[0] > clase.max) {
    mostrarMensaje(`La dirección no corresponde a la Clase ${claseSeleccionada}.`);
    o1.value = "";
    o1.focus();
    return;
  }

  ipValidada = true;
  octetos.forEach(input => input.disabled = true);
  radios.forEach(radio => radio.disabled = true);
  validar.disabled = true;
  cantidad.disabled = false;
  generar.disabled = false;
  borrar.disabled = false;

  mostrarMensaje("Dirección verificada. Ya puedes generar las subredes.");
  cantidad.focus();
});

generar.addEventListener("click", () => {
  if (!ipValidada) {
    mostrarMensaje("Valida la IP antes de calcular.");
    return;
  }

  const total = Number(cantidad.value);

  if (!total || total <= 0) {
    mostrarMensaje("Escribe una cantidad válida de subredes.");
    cantidad.focus();
    return;
  }

  const base = octetos.map(input => Number(input.value));
  let bits = 0;

  while ((2 ** bits) < total) bits++;

  const salto = 256 / (2 ** bits);
  const mascaraUltimo = 256 - salto;
  const mascara = `255.255.255.${mascaraUltimo}`;

  limpiarResultados();

  for (let i = 0; i < total; i++) {
    const avance = base[3] + (i * salto);
    const extraTercerOcteto = Math.floor(avance / 256);
    const cuarto = avance % 256;

    const n1 = base[0];
    const n2 = base[1];
    const n3 = base[2] + extraTercerOcteto;

    const direccion = `${n1}.${n2}.${n3}.${cuarto}`;
    const primera = `${n1}.${n2}.${n3}.${cuarto + 1}`;
    const ultima = `${n1}.${n2}.${n3}.${cuarto + salto - 2}`;
    const broadcast = `${n1}.${n2}.${n3}.${cuarto + salto - 1}`;
    const puerta = primera;

    listaNumero.value += `${i + 1}\n`;
    listaDireccion.value += `${direccion}\n`;
    listaMascara.value += `${mascara}\n`;
    listaPrimera.value += `${primera}\n`;
    listaUltima.value += `${ultima}\n`;
    listaBroadcast.value += `${broadcast}\n`;
    listaPuerta.value += `${puerta}\n`;
  }

  generar.disabled = true;
  cantidad.disabled = true;

  mostrarMensaje("Subredes calculadas correctamente.");
});

borrar.addEventListener("click", () => {
  claseSeleccionada = "";
  ipValidada = false;

  radios.forEach(radio => {
    radio.checked = false;
    radio.disabled = false;
  });

  octetos.forEach(input => {
    input.value = "";
    input.disabled = true;
  });

  rangoInicial.value = "";
  rangoFinal.value = "";
  cantidad.value = "";
  cantidad.disabled = true;
  validar.disabled = true;
  generar.disabled = true;
  borrar.disabled = true;

  limpiarResultados();
  mostrarMensaje("Formulario limpio. Puedes comenzar de nuevo.");
});

salir.addEventListener("click", () => {
  location.reload();
});
