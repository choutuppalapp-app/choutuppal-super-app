async function main() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/users', {
      headers: { 'Cache-Control': 'no-cache' }
    })
    const text = await res.text()
    console.log('Status:', res.status)
    if (res.status !== 200) console.log('Response:', text)
    else console.log('Parsed Array Length:', JSON.parse(text).length)
  } catch (e) {
    console.error(e)
  }
}
main()
