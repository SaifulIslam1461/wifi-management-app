package com.example.wifimanager.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "customers")
data class CustomerEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val mobile: String,
    val address: String,
    val macAddress: String,
    val monthlyBill: Double,
    val isPaid: Boolean,
    val connectionStatus: Boolean
)
