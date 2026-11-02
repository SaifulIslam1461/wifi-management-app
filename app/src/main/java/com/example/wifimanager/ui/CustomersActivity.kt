package com.example.wifimanager.ui

import android.os.Bundle
import android.widget.ArrayAdapter
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.wifimanager.data.AppDatabase
import com.example.wifimanager.data.CustomerEntity
import com.example.wifimanager.databinding.ActivityCustomersBinding
import kotlinx.coroutines.launch

class CustomersActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCustomersBinding
    private lateinit var db: AppDatabase

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCustomersBinding.inflate(layoutInflater)
        setContentView(binding.root)

        db = AppDatabase.getDatabase(this)
        loadCustomers()

        binding.btnAddSampleCustomer.setOnClickListener {
            lifecycleScope.launch {
                db.customerDao().insertCustomer(
                    CustomerEntity(
                        name = "রহিম উদ্দিন",
                        mobile = "01800000000",
                        address = "পরশুরাম, ফেনী",
                        macAddress = "AA:BB:CC:DD:EE:FF",
                        monthlyBill = 500.0,
                        isPaid = true,
                        connectionStatus = true
                    )
                )
                loadCustomers()
            }
        }
    }

    private fun loadCustomers() {
        lifecycleScope.launch {
            val customers = db.customerDao().getAllCustomers()
            val customerNames = customers.map { "${it.name} - ${it.mobile} (${if(it.isPaid) "Paid" else "Due"})" }
            val adapter = ArrayAdapter(this@CustomersActivity, android.R.layout.simple_list_item_1, customerNames)
            binding.listViewCustomers.adapter = adapter
        }
    }
}
