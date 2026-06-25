async function main() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appLogoUrl: 'test.png',
        faviconUrl: 'test.png',
        pwaIconUrl: 'test.png'
      })
    })
    const text = await res.text()
    console.log('Status:', res.status)
    console.log('Response:', text)
  } catch (e) {
    console.error(e)
  }
}
main()
