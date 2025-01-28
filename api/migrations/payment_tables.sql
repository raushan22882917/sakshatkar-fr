-- Create mentorship_payments table
CREATE TABLE IF NOT EXISTS mentorship_payments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    mentor_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_id VARCHAR(255) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(50) NOT NULL,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (mentor_id) REFERENCES mentor_profiles(id)
);

-- Create subscription_payments table
CREATE TABLE IF NOT EXISTS subscription_payments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_id VARCHAR(255) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mentorship_payments_user_id ON mentorship_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_payments_mentor_id ON mentorship_payments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_user_id ON subscription_payments(user_id);

-- Create view for mentorship payment details
CREATE OR REPLACE VIEW mentorship_payment_details AS
SELECT 
    mp.*,
    m.full_name as mentor_name,
    m.expertise as mentor_expertise
FROM mentorship_payments mp
JOIN mentor_profiles m ON mp.mentor_id = m.id;
