import unittest

from api.economy.settlement import calculate_co2e, settle


class TestEconomySettlement(unittest.TestCase):
    def test_calculate_co2e(self):
        self.assertEqual(calculate_co2e(1.0, 142.5), 142.5)
        self.assertEqual(calculate_co2e(0.0), 0.0)
        with self.assertRaises(ValueError):
            calculate_co2e(-5.0)

    def test_settle_normal_scenario(self):
        result = settle(units=600, price_idr=40_000)
        self.assertTrue(result["eligible"])
        self.assertEqual(result["gross"], 24_000_000)
        self.assertEqual(result["fee"], 480_000)
        self.assertEqual(result["net"], 23_520_000)
        self.assertEqual(result["community"], 14_112_000)
        self.assertEqual(result["manager"], 9_408_000)
        self.assertEqual(result["label"], "Simulasi, testnet")

    def test_settle_smoke_scenario(self):
        result = settle(units=500, price_idr=40_000)
        self.assertEqual(result["gross"], 20_000_000)
        self.assertEqual(result["fee"], 400_000)
        self.assertEqual(result["community"], 11_760_000)
        self.assertEqual(result["manager"], 7_840_000)

    def test_settle_blocked_or_disputed(self):
        result = settle(units=600, status="BLOCKED")
        self.assertFalse(result["eligible"])
        self.assertEqual(result["gross"], 0)


if __name__ == "__main__":
    unittest.main()
