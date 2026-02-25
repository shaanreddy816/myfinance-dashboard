export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    res.status(200).json({
        summary: "Based on your profile, here are some general financial tips.",
        top_actions: [
            { action: 'Build an emergency fund', reason: 'Aim for 3‑6 months of expenses.', priority: 'high' },
            { action: 'Review insurance coverage', reason: 'Ensure adequate term life cover.', priority: 'medium' }
        ],
        plan_7_days: [
            'Track all expenses for a week.',
            'Cancel unused subscriptions.'
        ],
        plan_30_days: [
            'Set up an automatic monthly investment of ₹5,000.',
            'Meet with a financial advisor.'
        ],
        disclaimer: 'This is sample advice for demonstration purposes.'
    });
}