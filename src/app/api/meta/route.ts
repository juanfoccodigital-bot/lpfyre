import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { accountId, accessToken, dateRange } = await req.json();

  if (!accountId || !accessToken) {
    return NextResponse.json({ error: "Account ID e Token são obrigatórios" }, { status: 400 });
  }

  // Default: last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const since = dateRange?.since || thirtyDaysAgo.toISOString().split("T")[0];
  const until = dateRange?.until || today.toISOString().split("T")[0];

  try {
    // Fetch campaign insights from Meta Marketing API
    const insightsUrl = `https://graph.facebook.com/v19.0/act_${accountId}/insights?fields=impressions,clicks,spend,actions,action_values,cpc,cpm,ctr,cost_per_action_type&time_range={"since":"${since}","until":"${until}"}&time_increment=1&level=account&access_token=${accessToken}`;

    const res = await fetch(insightsUrl);
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message, details: data.error }, { status: 400 });
    }

    // Parse insights into structured data
    const dailyData = (data.data || []).map((day: Record<string, unknown>) => {
      const actions = (day.actions as Array<{ action_type: string; value: string }>) || [];
      const actionValues = (day.action_values as Array<{ action_type: string; value: string }>) || [];
      const costPerAction = (day.cost_per_action_type as Array<{ action_type: string; value: string }>) || [];

      const leads = Number(actions.find((a) => a.action_type === "lead")?.value || actions.find((a) => a.action_type === "offsite_conversion.fb_pixel_lead")?.value || 0);
      const purchases = Number(actions.find((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase")?.value || 0);
      const revenue = Number(actionValues.find((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase")?.value || 0);
      const cpl = Number(costPerAction.find((a) => a.action_type === "lead" || a.action_type === "offsite_conversion.fb_pixel_lead")?.value || 0);

      const spend = Number(day.spend || 0);
      const impressions = Number(day.impressions || 0);
      const clicks = Number(day.clicks || 0);

      return {
        date: day.date_start,
        impressions,
        clicks,
        spend,
        leads,
        conversions: purchases,
        revenue,
        cpc: Number(day.cpc || 0),
        cpl: cpl || (leads > 0 ? spend / leads : 0),
        cpa: purchases > 0 ? spend / purchases : 0,
        roas: spend > 0 ? revenue / spend : 0,
        ctr: Number(day.ctr || 0),
      };
    });

    // Summary totals
    const summary = dailyData.reduce(
      (acc: Record<string, number>, d: Record<string, number>) => ({
        impressions: acc.impressions + d.impressions,
        clicks: acc.clicks + d.clicks,
        spend: acc.spend + d.spend,
        leads: acc.leads + d.leads,
        conversions: acc.conversions + d.conversions,
        revenue: acc.revenue + d.revenue,
      }),
      { impressions: 0, clicks: 0, spend: 0, leads: 0, conversions: 0, revenue: 0 }
    );

    const totalSpend = summary.spend || 1;
    summary.cpc = summary.clicks > 0 ? totalSpend / summary.clicks : 0;
    summary.cpl = summary.leads > 0 ? totalSpend / summary.leads : 0;
    summary.cpa = summary.conversions > 0 ? totalSpend / summary.conversions : 0;
    summary.roas = totalSpend > 0 ? summary.revenue / totalSpend : 0;
    summary.ctr = summary.impressions > 0 ? (summary.clicks / summary.impressions) * 100 : 0;

    // Also fetch active campaigns
    const campaignsUrl = `https://graph.facebook.com/v19.0/act_${accountId}/campaigns?fields=name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,insights.time_range({"since":"${since}","until":"${until}"}){impressions,clicks,spend,actions,cpc,ctr}&filtering=[{"field":"status","operator":"IN","value":["ACTIVE","PAUSED"]}]&limit=50&access_token=${accessToken}`;

    const campaignsRes = await fetch(campaignsUrl);
    const campaignsData = await campaignsRes.json();

    const campaigns = (campaignsData.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      objective: c.objective,
      daily_budget: c.daily_budget ? Number(c.daily_budget) / 100 : null,
      lifetime_budget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : null,
      start_time: c.start_time,
      stop_time: c.stop_time,
      insights: c.insights?.data?.[0] ? {
        impressions: Number(c.insights.data[0].impressions || 0),
        clicks: Number(c.insights.data[0].clicks || 0),
        spend: Number(c.insights.data[0].spend || 0),
        cpc: Number(c.insights.data[0].cpc || 0),
        ctr: Number(c.insights.data[0].ctr || 0),
      } : null,
    }));

    return NextResponse.json({ daily: dailyData, summary, campaigns, period: { since, until } });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao conectar com Meta API", details: String(err) }, { status: 500 });
  }
}
