import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Application root element not found.')
}

app.innerHTML = `
  <main>
    <h1>Mario Runner</h1>
  </main>
`
