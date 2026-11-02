package com.example.wifimanager

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.wifimanager.databinding.ActivityMainBinding
import com.example.wifimanager.ui.CustomersActivity
import com.example.wifimanager.utils.RouterManager
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnCheckConnection.setOnClickListener {
            runConnectionTest()
        }

        binding.btnOpenCustomers.setOnClickListener {
            startActivity(Intent(this, CustomersActivity::class.java))
        }
    }

    private fun runConnectionTest() {
        binding.tvRouterStatus.text = "Status: Testing..."
        binding.tvRouterStatus.setTextColor(Color.parseColor("#D97706"))
        binding.tvResponseTime.text = "..."

        lifecycleScope.launch {
            val (isConnected, time) = RouterManager.testConnection()
            if (isConnected) {
                binding.tvRouterStatus.text = "Status: Connected"
                binding.tvRouterStatus.setTextColor(Color.parseColor("#10B981"))
                binding.tvResponseTime.text = "$time ms"
            } else {
                binding.tvRouterStatus.text = "Status: Not Connected"
                binding.tvRouterStatus.setTextColor(Color.parseColor("#EF4444"))
                binding.tvResponseTime.text = "Timeout"
            }
        }
    }
}
