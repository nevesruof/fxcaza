import {defineConfig} from 'vite';
export default defineConfig({root:'web',publicDir:false,server:{host:'0.0.0.0',allowedHosts:['terminal.local']}});
