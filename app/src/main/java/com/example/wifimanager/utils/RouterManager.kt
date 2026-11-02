package com.example.wifimanager.utils

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

object RouterManager {
    suspend fun testConnection(ipAddress: String = "192.168.0.1"): Pair<Boolean, Long> {
        return withContext(Dispatchers.IO) {
            var connection: HttpURLConnection? = null
            val startTime = System.currentTimeMillis()
            try {
                val url = URL("http://$ipAddress/")
                connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 3000
                connection.readTimeout = 3000

                val responseCode = connection.responseCode
                val endTime = System.currentTimeMillis()
                val duration = endTime - startTime

                Pair(responseCode in 200..399, duration)
            } catch (e: Exception) {
                Pair(false, 0L)
            } finally {
                connection?.disconnect()
            }
        }
    }
}
