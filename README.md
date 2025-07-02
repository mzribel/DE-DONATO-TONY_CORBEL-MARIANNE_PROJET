# Pomodoro App

## Dév

1. Run server
```shell
npm run dev
```

2. Dans un autre terminal, run l'app electron :
```shell
npm run dev:electron
```

## Build

Il faut modifier le fichier `/electron/main.ts` :
```ts
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
```

Puis dans un terminal **en administrateur** :
```shell
npm run dist
```

L'application générée se trouvera dans `/dist/win-unpacked`.
