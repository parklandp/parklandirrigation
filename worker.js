addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    // Replace these values with your Shopify API credentials 
    const shopifyApiKey = SHOPIFY_STOREFRONT_ACCESS_TOKEN
    const shopifyStoreUrl = 'https://parklandproducts.myshopify.com'
  
    const graphqlQuery = `
    {
      products(first:15) {
        edges {
          node {
            id
            title
            description
            variants(first: 1) {
              edges {
                node {
                  price
                  sku
                }
              }
            }
          }
        }
      }
    }
    `
  
    // Make request to Shopify GraphQL API
    const response = await fetch(`${shopifyStoreUrl}/admin/api/2021-07/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopifyApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: graphqlQuery }),
    })
  
    // Check if request was successful
    if (!response.ok) {
      return new Response('Failed to fetch product information from Shopify', { status: response.status })
    }
  
    // Parse the JSON response
    const responseData = await response.json()
  
    // Extract product data
    const products = responseData.data.products.edges.map(edge => {
      const { id, title, description } = edge.node
      const variant = edge.node.variants.edges[0].node
      const { price, sku } = variant
      return { id, title, description, price, sku }
    })
  
    // Do something with the products, e.g., return them as JSON
   // return new Response(JSON.stringify(products), { headers: { 'Content-Type': 'application/json' } })
      // Render products as HTML
      const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shopify Products</title>
      </head>
      <body>
        <h1>Shopify Products</h1>
        <ul>
          ${products.map(product => `
            <li>
              <h2>${product.title}</h2>
              <p>${product.description}</p>
              <p>Price: ${product.price}</p>
              <p>SKU: ${product.sku}</p>
            </li>
          `).join('')}
        </ul>
      </body>
      </html>
    `
  
    return new Response(htmlResponse, { headers: { 'Content-Type': 'text/html' } })
  }