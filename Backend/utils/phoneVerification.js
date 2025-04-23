import axios from "axios";

// Verify phone number with NumVerify API
export const verifyPhoneWithNumVerify = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    const response = await axios.get(
      `http://apilayer.net/api/validate?access_key=${process.env.NUMVERIFY_API_KEY}&number=${phoneNumber}&format=1`
    );
    
    return {
      valid: response.data.valid,
      number: response.data.number,
      localFormat: response.data.local_format,
      internationalFormat: response.data.international_format,
      countryPrefix: response.data.country_prefix,
      countryCode: response.data.country_code,
      countryName: response.data.country_name,
      location: response.data.location,
      carrier: response.data.carrier,
      lineType: response.data.line_type,
      ...response.data
    };
  } catch (error) {
    console.error("NumVerify verification error:", error);
    return { valid: false };
  }
};

// Generate a random verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};