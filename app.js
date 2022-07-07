const express = require('express')
const axios = require('axios')
const redis = require('redis')
const app = express()
const PORT = process.env.PORT || 9000
const REDIS_PORT = process.env.REDIS_PORT || 6379
const client = redis.createClient({url: 'redis://redis:6379'})
client.connect()
client.on('connect', () => console.log(`Redis is connected on port ${REDIS_PORT}`))
client.on("error", (error) => console.error(error))

app.get('/api/v1/users/:username', async (req, res) => {
    try
    {
      const username = req.params.username
      const data=await client.get(username);
      console.log(data)
      if(data)
      {
        return res.status(200).send({
          message: `Retrieved ${username}'s data from the cache`,
          users: JSON.parse(data)
        })
      }
      else
      {
        const api = await axios.get(`https://jsonplaceholder.typicode.com/users/?username=${username}`)
        client.setEx(username, 1440, JSON.stringify(api.data))
        return res.status(200).send({
          message: `Retrieved ${username}'s data from the server`,
          users: api.data
        })
      }
      
    }
    catch(error)
    {
      console.log(error)
    }
  })

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

module.exports = app