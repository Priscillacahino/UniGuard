package com.priscillacahino.uniguard

import org.junit.Test

import org.junit.Assert.*

class ExampleUnitTest {
    @Test
    fun sanitizeNumber_removesFormattingAndKeepsCountryCode() {
        assertEquals(
            "+5583999999999",
            IntegratedSosActivity.sanitizeNumber("+55 (83) 99999-9999")
        )
    }

    @Test
    fun isValidNumber_acceptsValidBrazilianMobileNumber() {
        assertTrue(IntegratedSosActivity.isValidNumber("5583999999999"))
    }

    @Test
    fun isValidNumber_rejectsShortOrInvalidNumber() {
        assertFalse(IntegratedSosActivity.isValidNumber("9999"))
        assertFalse(IntegratedSosActivity.isValidNumber("telefone"))
    }
}
