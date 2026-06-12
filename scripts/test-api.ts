async function testAPI() {
  try {
    console.log('Fetching News API...');
    const newsRes = await fetch('https://choutuppal.in/api/news');
    console.log('News Status:', newsRes.status);
    if (newsRes.ok) {
      const newsData = await newsRes.json();
      console.log(`News Titles Found (${newsData.news?.length || 0}):`, newsData.news?.map((n: any) => n.title).join(', '));
    }

    console.log('\nFetching Blogs API...');
    const blogsRes = await fetch('https://choutuppal.in/api/blogs');
    console.log('Blogs Status:', blogsRes.status);
    if (blogsRes.ok) {
      const blogsData = await blogsRes.json();
      console.log(`Blogs Titles Found (${blogsData.blogs?.length || 0}):`, blogsData.blogs?.map((b: any) => b.title).join(', '));
    }
  } catch (error) {
    console.error('API Fetch Error:', error);
  }
}

testAPI();
