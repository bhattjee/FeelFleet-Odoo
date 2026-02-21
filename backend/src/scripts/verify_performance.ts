import { AnalyticsService } from '../backend/src/modules/analytics/analytics.service';

async function verifyAnalytics() {
    console.log('--- Verifying Analytics Metrics ---');

    const kpis = await AnalyticsService.getDashboardKPIs();
    console.log('Dashboard KPIs:', kpis);

    const financial = await AnalyticsService.getFinancialSummary();
    console.log('Financial Summary:', financial);

    const fuelTrend = await AnalyticsService.getFuelEfficiencyTrend();
    console.log('Fuel Efficiency Trend:', fuelTrend);

    const costlyVehicles = await AnalyticsService.getTopCostlyVehicles();
    console.log('Top Costly Vehicles:', costlyVehicles);

    console.log('--- Verification Complete ---');
}

verifyAnalytics().catch(console.error);
