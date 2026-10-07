
window.Profile = Object.freeze({
  name: 'Fxczasa',
  discordUserId: '1263242767895760936',
  email: ''
});

for (const link of document.querySelectorAll('a[href^="https://discord.com/users/"]')) {
  link.href = `https://discord.com/users/${window.Profile.discordUserId}`;
}
