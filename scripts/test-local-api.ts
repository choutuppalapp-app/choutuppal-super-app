async function testAPI() {
  try {
    const newsRes = await fetch('http://localhost:3000/api/news');
    console.log('Local News Status:', newsRes.status);
    const newsData = await newsRes.text();
    console.log('Local News Body:', newsData.substring(0, 500));
  } catch (error) {
    console.error('API Fetch Error:', error);
  }
}
testAPI();
