// js/themes.js — catálogo de temas e utilidades

// Cada tema é um array ORDENADO por progressão do 2048 (2,4,8,...)
// id = valor da tile; nome e img = como renderizar
const THEMES = {
  fgv: {
    id: "fgv",
    label: "FGV",
    goalName: "FGV",
    items: [
      { id: 2,   nome: "Insper",    img: "img/insper.jpeg" },
      { id: 4,   nome: "USP",       img: "img/usp.jpg" },
      { id: 8,   nome: "Ibmec",     img: "img/ibmec.png" },
      { id: 16,  nome: "FAAP",      img: "img/faap.png" },
      { id: 32,  nome: "ESPM",      img: "img/espm.png" },
      { id: 64,  nome: "Mackenzie", img: "img/mack.png" },
      { id: 128, nome: "Uninove",   img: "img/uninove.png" },
      { id: 256, nome: "ITA",       img: "img/ita.png" },
      { id: 512, nome: "Yale",      img: "img/yale.png" },
      { id: 1024,nome: "Harvard",   img: "img/harvard.png" },
      { id: 2048,nome: "FGV",       img: "img/fgv.jpg" },
      { id: 4096,nome: "dinheiro",  img: "img/dinheiro.png" }
    ]
  },

  // Exemplo de outro tema (edite as imagens/ordem como quiser)
  usp: {
    id: "usp",
    label: "USP",
    goalName: "USP",
    items: [
      { id: 2,   nome: "Insper",    img: "img/insper.jpeg" },
      { id: 4,   nome: "Ibmec",     img: "img/ibmec.png" },
      { id: 8,   nome: "FAAP",      img: "img/faap.png" },
      { id: 16,  nome: "ESPM",      img: "img/espm.png" },
      { id: 32,  nome: "Mackenzie", img: "img/mack.png" },
      { id: 64,  nome: "Uninove",   img: "img/uninove.png" },
      { id: 128, nome: "ITA",       img: "img/ita.png" },
      { id: 256, nome: "Yale",      img: "img/yale.png" },
      { id: 512, nome: "Harvard",   img: "img/harvard.png" },
      { id: 1024,nome: "FGV",       img: "img/fgv.jpg" },
      { id: 2048,nome: "USP",       img: "img/usp.jpg" },
      { id: 4096,nome: "dinheiro",  img: "img/dinheiro.png" }
    ]
  },

  insper: {
    id: "insper",
    label: "Insper",
    goalName: "Insper",
    items: [
      { id: 2,   nome: "USP",       img: "img/usp.jpg" },
      { id: 4,   nome: "Ibmec",     img: "img/ibmec.png" },
      { id: 8,   nome: "FAAP",      img: "img/faap.png" },
      { id: 16,  nome: "ESPM",      img: "img/espm.png" },
      { id: 32,  nome: "Mackenzie", img: "img/mack.png" },
      { id: 64,  nome: "Uninove",   img: "img/uninove.png" },
      { id: 128, nome: "ITA",       img: "img/ita.png" },
      { id: 256, nome: "Yale",      img: "img/yale.png" },
      { id: 512, nome: "Harvard",   img: "img/harvard.png" },
      { id: 1024,nome: "FGV",       img: "img/fgv.jpg" },
      { id: 2048,nome: "Insper",    img: "img/insper.jpeg" },
      { id: 4096,nome: "dinheiro",  img: "img/dinheiro.png" }
    ]
  },

  // Adicione mais temas aqui (insper, espm, ibmec, “Top ENEM”, “Ivy League”…)
};

// ===== Persistência / API global =====
const THEME_STORAGE_KEY = "getfgv_theme_id";

function getSavedThemeId(){
  return localStorage.getItem(THEME_STORAGE_KEY) || "fgv";
}

function setSavedThemeId(id){
  localStorage.setItem(THEME_STORAGE_KEY, id);
}

function getTheme(id){
  return THEMES[id] || THEMES.fgv;
}

function getCurrentTheme(){
  return getTheme(getSavedThemeId());
}

// Busca a imagem pelo valor da tile (2,4,8,...)
function getImageForValue(value){
  const theme = getCurrentTheme();
  const found = theme.items.find(x => x.id === value);
  return found ? found.img : null;
}

// Busca o nome pelo valor da tile (para tooltips, etc.)
function getNameForValue(value){
  const theme = getCurrentTheme();
  const found = theme.items.find(x => x.id === value);
  return found ? found.nome : String(value);
}

// Exponha globalmente para html_actuator.js e outros scripts:
window.GetFGVThemes = {
  THEMES,
  getCurrentTheme,
  setSavedThemeId,
  getImageForValue,
  getNameForValue
};
