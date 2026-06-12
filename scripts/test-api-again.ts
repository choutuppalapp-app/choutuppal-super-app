async function testAPI() {
  try {
    const newsRes = await fetch('https://choutuppal.in/api/news');
    console.log('News Status:', newsRes.status);
    const newsData = await newsRes.text();
    console.log('News Body (first 200 chars):', newsData.substring(0, 200));

    const blogsRes = await fetch('https://choutuppal.in/api/blogs');
    console.log('Blogs Status:', blogsRes.status);
    const blogsData = await blogsRes.text();
    console.log('Blogs Body (first 200 chars):', blogsData.substring(0, 200));
  } catch (error) {
    console.error('API Fetch Error:', error);
  }
}
testAPI();
