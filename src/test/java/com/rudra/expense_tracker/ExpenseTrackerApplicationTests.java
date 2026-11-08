package com.rudra.expense_tracker;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Integration test requires running MySQL instance on localhost:3306")
class ExpenseTrackerApplicationTests {

	@Test
	void contextLoads() {
	}

}
