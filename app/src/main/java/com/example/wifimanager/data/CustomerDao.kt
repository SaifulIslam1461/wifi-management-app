package com.example.wifimanager.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface CustomerDao {
    @Query("SELECT * FROM customers")
    suspend fun getAllCustomers(): List<CustomerEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: CustomerEntity)

    @Query("SELECT SUM(monthlyBill) FROM customers WHERE isPaid = 1")
    suspend fun getTotalIncome(): Double?

    @Query("SELECT SUM(monthlyBill) FROM customers WHERE isPaid = 0")
    suspend fun getTotalDue(): Double?
}
