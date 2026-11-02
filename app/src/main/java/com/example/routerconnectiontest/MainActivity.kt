package com.example.routerconnectiontest

import android.graphics.Color
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.routerconnectiontest.databinding.ActivityMainBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnCheckConnection.setOnClickListener {
            performConnectionTest()
        }
    }

    private fun performConnectionTest() {
        if (!isWifiConnected()) {
            binding.tvStatus.text = "Wi-Fi Disconnected"
            binding.tvStatus.setTextColor(Color.parseColor("#DC2626"))
            binding.tvResponseTime.text = "-- ms"
            return
        }

        binding.progressBar.visibility = View.VISIBLE
        binding.btnCheckConnection.isEnabled = false
        binding.tvStatus.text = "Testing..."
        binding.tvStatus.setTextColor(Color.parseColor("#D97706"))
        binding.tvResponseTime.text = "Measuring..."

        lifecycleScope.launch {
            val result = measureRouterResponseTime()

            binding.progressBar.visibility = View.GONE
            binding.btnCheckConnection.isEnabled = true

            if (result.first) {
                binding.tvStatus.text = "Connected"
                binding.tvStatus.setTextColor(Color.parseColor("#16A34A"))
                binding.tvResponseTime.text = "${result.second} ms"
            } else {
                binding.tvStatus.text = "Not Connected"
                binding.tvStatus.setTextColor(Color.parseColor("#DC2626"))
                binding.tvResponseTime.text = "Timeout"
            }
        }
    }

    private suspend fun measureRouterResponseTime(): Pair<Boolean, Long> {
        return withContext(Dispatchers.IO) {
            var connection: HttpURLConnection? = null
            val startTime = System.currentTimeMillis()
            try {
                val url = URL("http://192.168.0.1/")
                connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 3000
                connection.readTimeout = 3000

                val responseCode = connection.responseCode
                val endTime = System.currentTimeMillis()
                val duration = endTime - startTime

                val isSuccess = responseCode in 200..399
                Pair(isSuccess, duration)
            } catch (e: Exception) {
                Pair(false, 0L)
            } finally {
                connection?.disconnect()
            }
        }
    }

    private fun isWifiConnected(): Boolean {
        val connectivityManager = getSystemService(ConnectivityManager::class.java)
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
    }
}
