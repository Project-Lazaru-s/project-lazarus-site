// Constantes da tela de carregamento, num módulo comum: o layout (servidor) precisa da string do script.
export const BOOT_KEY = "lazarus:booted";
export const BOOT_MS = 1600;

/**
 * Roda no <head> antes da pintura: liga a tela de carregamento só na primeira página da sessão
 * (e nunca para quem prefere menos movimento), para o site não piscar antes dela.
 * Já marca a sessão aqui: sair antes do fim da animação não faz a tela voltar.
 */
export const bootScript = `try{if(!sessionStorage.getItem("${BOOT_KEY}")&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){document.documentElement.setAttribute("data-boot","");sessionStorage.setItem("${BOOT_KEY}","1")}}catch(e){}`;
