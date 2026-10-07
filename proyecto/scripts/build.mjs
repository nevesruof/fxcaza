import {cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await cp('web','dist',{recursive:true});
console.log('Static site built.');
