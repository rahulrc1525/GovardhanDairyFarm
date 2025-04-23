import React, { useContext, useEffect, useState } from "react";
import "./Placeorder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const PlaceOrder = () => {
  const { cart, token, foodList, url, clearCart, userId } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    ZipCode: "",
    country: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [pincodeSuggestions, setPincodeSuggestions] = useState(null);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  // Predefined list of cities, states and pincodes for manual validation
  const cityStatePincodeMap = [
    // Mumbai Metropolitan Region (MMR)
    {
      city: "Mumbai",
      state: "Maharashtra",
      pincodes: ["400001", "400002", "400003", "400004", "400005", "400006", "400007", "400008", "400009", "400010", "400011", "400012", "400013", "400014", "400015", "400016", "400017", "400018", "400019", "400020", "400021", "400022", "400023", "400024", "400025", "400026", "400027", "400028", "400029", "400030", "400031", "400032", "400033", "400034", "400035", "400036", "400037", "400038", "400039", "400040", "400041", "400042", "400043", "400044", "400045", "400046", "400047", "400048", "400049", "400050", "400051", "400052", "400053", "400054", "400055", "400056", "400057", "400058", "400059", "400060", "400061", "400062", "400063", "400064", "400065", "400066", "400067", "400068", "400069", "400070", "400071", "400072", "400073", "400074", "400075", "400076", "400077", "400078", "400079", "400080", "400081", "400082", "400083", "400084", "400085", "400086", "400087", "400088", "400089", "400090", "400091", "400092", "400093", "400094", "400095", "400096", "400097", "400098", "400099", "400101", "400102", "400103", "400104", "400105", "400106", "400107"]
    },
    {
      city: "Thane",
      state: "Maharashtra",
      pincodes: ["400601", "400602", "400603", "400604", "400605", "400606", "400607", "400608", "400610", "400612", "400614", "400615", "421601", "421602", "421603", "421604", "421605", "421606", "421607", "421608", "421609", "421610", "421611", "421612", "421613", "421614", "421615"]
    },
    {
      city: "Navi Mumbai",
      state: "Maharashtra",
      pincodes: ["400703", "400704", "400705", "400706", "400707", "400708", "400709", "400710", "410206", "410208", "410210", "410218", "410222"]
    },
    {
      city: "Kalyan",
      state: "Maharashtra",
      pincodes: ["421301", "421302", "421303", "421304", "421305", "421306", "421308"]
    },
    {
      city: "Dombivli",
      state: "Maharashtra",
      pincodes: ["421201", "421202", "421203", "421204", "421205"]
    },
    {
      city: "Mira-Bhayandar",
      state: "Maharashtra",
      pincodes: ["401101", "401102", "401103", "401104", "401105", "401106", "401107"]
    },
    {
      city: "Vasai",
      state: "Maharashtra",
      pincodes: ["401201", "401202", "401203", "401204", "401207"]
    },
    {
      city: "Virar",
      state: "Maharashtra",
      pincodes: ["401303", "401305"]
    },
    {
      city: "Bhiwandi",
      state: "Maharashtra",
      pincodes: ["421302", "421305", "421308", "421311", "421312"]
    },
    {
      city: "Panvel",
      state: "Maharashtra",
      pincodes: ["410206", "410208", "410209", "410210", "410218", "410222"]
    },
    {
      city: "Ulhasnagar",
      state: "Maharashtra",
      pincodes: ["421001", "421002", "421003", "421004", "421005"]
    },
    {
      city: "Palghar",
      state: "Maharashtra",
      pincodes: ["401404", "401405", "401408"]
    },
    {
      city: "Dahisar",
      state: "Maharashtra",
      pincodes: ["400068", "400069", "400070", "400071", "400072"]
    },
    {
      city: "Goregaon",
      state: "Maharashtra",
      pincodes: ["400063", "400064", "400065", "400066", "400067"]
    },
    {
      city: "Borivali",
      state: "Maharashtra",
      pincodes: ["400066", "400067", "400068", "400069", "400070"]
    },
    {
      city: "Malad",
      state: "Maharashtra",
      pincodes: ["400064", "400065", "400066", "400067", "400068"]
    },
    {
      city: "Andheri",
      state: "Maharashtra",
      pincodes: ["400053", "400054", "400055", "400056", "400057", "400058", "400059"]
    },
    {
      city: "Dadar",
      state: "Maharashtra",
      pincodes: ["400014", "400015", "400016", "400017", "400018"]
    },
    {
      city: "Bandra",
      state: "Maharashtra",
      pincodes: ["400050", "400051", "400052", "400053", "400054"]
    },
    {
      city: "Juhu",
      state: "Maharashtra",
      pincodes: ["400049", "400050", "400051", "400052", "400053"]
    },
    {
      city: "Versova",
      state: "Maharashtra",
      pincodes: ["400061", "400062", "400063", "400064", "400065"]
    },
    {
      city: "Malabar Hill",
      state: "Maharashtra",
      pincodes: ["400006", "400007", "400008", "400009", "400010"]
    },
    {
      city: "Marine Lines",
      state: "Maharashtra",
      pincodes: ["400020", "400021", "400022", "400023", "400024"]
    },
    {
      city: "Fort",
      state: "Maharashtra",
      pincodes: ["400001", "400002", "400003", "400004", "400005"]
    },
    {
      city: "Worli",
      state: "Maharashtra",
      pincodes: ["400018", "400019", "400020", "400021", "400022"]
    },
    {
      city: "Sion",
      state: "Maharashtra",
      pincodes: ["400022", "400023", "400024", "400025", "400026"]
    },
    {
      city: "Matunga",
      state: "Maharashtra",
      pincodes: ["400019", "400020", "400021", "400022", "400023"]
    },
    // Pune Region
    {
      city: "Pune",
      state: "Maharashtra",
      pincodes: ["411001", "411002", "411003", "411004", "411005", "411006", "411007", "411008", "411009", "411011", "411012", "411013", "411014", "411015", "411016", "411017", "411018", "411019", "411020", "411021", "411022", "411023", "411024", "411025", "411026", "411027", "411028", "411029", "411030", "411031", "411032", "411033", "411034", "411035", "411036", "411037", "411038", "411039", "411040", "411041", "411042", "411043", "411044", "411045", "411046", "411047", "411048", "411051", "411052", "411057", "411058"]
    },
    {
      city: "Pimpri-Chinchwad",
      state: "Maharashtra",
      pincodes: ["411019", "411033", "411044", "411017", "411018", "411019", "411027", "411035", "411044"]
    },
    {
      city: "Hinjewadi",
      state: "Maharashtra",
      pincodes: ["411057", "411033"]
    },
    {
      city: "Lonavala",
      state: "Maharashtra",
      pincodes: ["410401", "410402", "410403", "410404", "410405"]
    },
    {
      city: "Khandala",
      state: "Maharashtra",
      pincodes: ["410301", "410302", "410303", "410304", "410305"]
    },
    {
      city: "Alibaug",
      state: "Maharashtra",
      pincodes: ["402201", "402202", "402203", "402204", "402205", "402206"]
    },
    {
      city: "Karjat",
      state: "Maharashtra",
      pincodes: ["410201", "410202", "410203", "410204", "410205"]
    },
    {
      city: "Dapoli",
      state: "Maharashtra",
      pincodes: ["415712", "415713", "415714", "415715", "415716"]
    },
    {
      city: "Ratnagiri",
      state: "Maharashtra",
      pincodes: ["415612", "415613", "415614", "415615", "415616", "415617"]
    },
    {
      city: "Sindhudurg",
      state: "Maharashtra",
      pincodes: ["416601", "416602", "416603", "416604", "416605", "416606"]
    },
    {
      city: "Satara",
      state: "Maharashtra",
      pincodes: ["415001", "415002", "415003", "415004", "415005", "415006", "415007", "415008", "415009", "415010", "415011", "415012"]
    },
    // Nashik Region
    {
      city: "Nashik",
      state: "Maharashtra",
      pincodes: ["422001", "422002", "422003", "422004", "422005", "422006", "422007", "422008", "422009", "422010", "422011", "422012", "422013", "422101", "422102", "422103", "422104", "422105", "422112"]
    },
    {
      city: "Malegaon",
      state: "Maharashtra",
      pincodes: ["423203", "423204", "423205", "423206", "423207", "423208", "423209"]
    },
    // Aurangabad Region
    {
      city: "Aurangabad",
      state: "Maharashtra",
      pincodes: ["431001", "431002", "431003", "431004", "431005", "431006", "431007", "431008", "431009", "431010", "431011", "431136"]
    },
    {
      city: "Jalna",
      state: "Maharashtra",
      pincodes: ["431203", "431204", "431213", "431214"]
    },
    // Nagpur Region
    {
      city: "Nagpur",
      state: "Maharashtra",
      pincodes: ["440001", "440002", "440003", "440004", "440005", "440006", "440007", "440008", "440009", "440010", "440011", "440012", "440013", "440014", "440015", "440016", "440017", "440018", "440019", "440020", "440021", "440022", "440023", "440024", "440025", "440026", "440027", "440028", "440029", "440030", "440031", "440032", "440033", "440034", "440035", "440036"]
    },
    {
      city: "Amravati",
      state: "Maharashtra",
      pincodes: ["444601", "444602", "444603", "444604", "444605", "444606", "444607", "444701", "444802", "444803", "444804", "444805", "444806", "444807"]
    },
    // Kolhapur Region
    {
      city: "Kolhapur",
      state: "Maharashtra",
      pincodes: ["416001", "416002", "416003", "416004", "416005", "416006", "416007", "416008", "416009", "416010", "416011", "416012", "416013", "416101", "416102", "416103", "416104", "416105", "416106", "416107", "416108", "416109", "416110", "416111", "416112", "416113", "416114", "416115", "416116", "416122", "416143", "416144", "416146", "416201", "416202", "416203", "416204", "416205", "416206", "416207", "416208", "416209", "416210", "416211", "416212", "416213", "416214", "416215", "416216", "416218", "416219", "416220", "416221", "416229", "416230", "416231", "416232", "416234", "416235", "416236", "416301", "416302", "416303", "416304", "416305", "416306", "416307", "416308", "416310", "416311", "416312", "416313", "416314", "416315", "416316", "416401", "416402", "416403", "416404", "416405", "416406", "416407", "416408", "416409", "416410", "416411", "416412", "416413", "416414", "416415", "416416", "416417", "416418", "416419", "416420", "416421", "416422", "416423", "416424", "416425", "416426", "416427", "416428", "416429", "416430", "416431", "416432", "416433", "416434", "416436", "416437", "416438", "416439", "416440", "416441", "416442", "416443", "416444", "416445", "416446", "416447", "416448", "416449", "416450", "416451", "416452", "416453", "416601", "416602", "416603", "416604", "416605", "416606", "416607", "416608", "416609", "416610", "416611", "416612", "416613", "416614", "416615", "416616", "416617", "416618", "416619", "416620", "416621", "416622", "416623", "416624", "416625", "416626", "416628", "416629", "416630", "416631", "416632", "416633", "416634", "416635", "416636", "416637", "416638", "416639", "416640", "416641", "416642", "416643", "416644", "416645", "416646", "416647", "416648", "416649", "416650", "416651", "416652", "416653", "416654", "416655", "416656", "416657", "416658", "416659", "416660", "416661", "416662", "416663", "416664", "416665", "416666", "416667", "416668", "416669", "416670", "416671", "416672", "416673", "416674", "416675", "416676", "416677", "416678", "416679", "416680", "416681", "416682", "416683", "416684", "416685", "416686", "416687", "416688", "416689", "416690", "416691", "416692", "416693", "416694", "416695", "416696", "416697", "416698", "416699", "416801", "416802", "416803", "416804", "416805", "416806", "416807", "416808", "416809", "416810", "416811", "416812", "416813", "416814", "416815", "416816", "416817", "416818", "416819", "416820", "416821", "416822", "416823", "416824", "416825", "416826", "416827", "416828", "416829", "416830", "416831", "416832", "416833", "416834", "416835", "416836", "416837", "416838", "416839", "416840", "416841", "416842", "416843", "416844", "416845", "416846", "416847", "416848", "416849", "416850", "416851", "416852", "416853", "416854", "416855", "416856", "416857", "416858", "416859", "416860", "416861", "416862", "416863", "416864", "416865", "416866", "416867", "416868", "416869", "416870", "416871", "416872", "416873", "416874", "416875", "416876", "416877", "416878", "416879", "416880", "416881", "416882", "416883", "416884", "416885", "416886", "416887", "416888", "416889", "416890", "416891", "416892", "416893", "416894", "416895", "416896", "416897", "416898", "416899"]
    }
  ];

  // Extract unique cities for suggestions
  const allCities = [...new Set(cityStatePincodeMap.map(item => item.city))];
    
  useEffect(() => {
    const loadRazorpay = async () => {
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          console.log("Razorpay SDK loaded successfully");
          setRazorpayLoaded(true);
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay SDK");
          setRazorpayLoaded(false);
        };
        document.body.appendChild(script);
      } else {
        console.log("Razorpay SDK already loaded");
        setRazorpayLoaded(true);
      }
    };
    loadRazorpay();
  }, []);

  const subtotal = Object.keys(cart).reduce((acc, itemId) => {
    const itemInfo = foodList.find((product) => product._id === itemId);
    return itemInfo ? acc + itemInfo.price * cart[itemId] : acc;
  }, 0);
  const deliveryFee = subtotal > 0 ? 100 : 0;
  const total = subtotal + deliveryFee;

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    
    if (name === "ZipCode") {
      setPincodeSuggestions(null);
    }

    if (name === "city") {
      // Filter cities based on input
      const filteredCities = allCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setCitySuggestions(filteredCities);
      setShowCitySuggestions(true);
    } else {
      setShowCitySuggestions(false);
    }
  };

  const handleCitySelect = (city) => {
    setData(prev => ({
      ...prev,
      city: city,
      state: "Maharashtra" // Auto-fill state since we only deliver in Maharashtra
    }));
    setShowCitySuggestions(false);
  };

  const validateCityStatePincode = () => {
    const { ZipCode, city, state } = data;
    let isValid = true;
    const newErrors = {};
    setPincodeSuggestions(null);

    if (!ZipCode || !city || !state) {
      newErrors.ZipCode = "Pincode, city, and state are required";
      return { isValid: false, newErrors };
    }

    // Basic pincode format check (6 digits for India)
    if (!/^\d{6}$/.test(ZipCode)) {
      newErrors.ZipCode = "Pincode must be 6 digits";
      return { isValid: false, newErrors };
    }

    // Check if state is Maharashtra
    if (state.toLowerCase() !== "maharashtra") {
      newErrors.state = "We currently only deliver in Maharashtra";
      isValid = false;
    }

    // Find matching entries in our predefined list
    const matchingEntries = cityStatePincodeMap.filter(entry => 
      entry.city.toLowerCase() === city.toLowerCase() && 
      entry.state.toLowerCase() === state.toLowerCase()
    );

    if (matchingEntries.length === 0) {
      newErrors.city = "Delivery not available in this city. Please contact us for more information.";
      newErrors.state = "Delivery not available in this area";
      isValid = false;
    } else {
      // Check if pincode is valid for this city-state
      const pincodeValid = matchingEntries.some(entry => 
        entry.pincodes.includes(ZipCode)
      );

      if (!pincodeValid) {
        newErrors.ZipCode = "Delivery not available for this pincode. Please contact us for more information.";
        isValid = false;
      }
    }

    return { isValid, newErrors };
  };

  const validateForm = async () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "street",
      "city",
      "state",
      "ZipCode",
      "phone",
    ];
    const newErrors = {};

    // Basic field validation
    requiredFields.forEach((field) => {
      if (!data[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Invalid email format";
    }

    if (data.phone && !/^\d{10}$/.test(data.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);

    // Only proceed with pincode validation if basic fields are valid
    if (Object.keys(newErrors).length === 0) {
      const { isValid, newErrors: pincodeErrors } = validateCityStatePincode();
      setErrors(prev => ({ ...prev, ...pincodeErrors }));
      return isValid;
    }

    return false;
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    const isFormValid = await validateForm();
    if (!isFormValid) {
      alert("Please fill all the required fields correctly.");
      return;
    }

    setLoading(true);

    const orderItems = foodList
      .filter((item) => cart[item._id] > 0)
      .map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: cart[item._id],
      }));

    const orderData = {
      userId: token,
      items: orderItems,
      amount: total * 100, // Convert amount to paise
      address: data,
      status: "Food Processing",
      userEmail: data.email,
    };

    console.log("Order Data being sent:", orderData);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await fetch(`${url}/api/order/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log("Order Placement Response:", result);

      if (response.status === 201 && result.success) {
        handleRazorpayPayment(result.order);
      } else {
        alert("Failed to create order. Try again.");
        console.error("Order creation failed. Response:", result);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred while placing the order.");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (order) => {
    if (!razorpayLoaded || !window.Razorpay) {
      console.error("Razorpay SDK not loaded.");
      return;
    }

    const options = {
      key: "rzp_test_K1augfcwb6fgUh",
      amount: order.amount,
      currency: "INR",
      name: "Govardhan Dairy Farm",
      description: "Complete your payment",
      order_id: order.id,
      handler: async function (response) {
        console.log("Razorpay Payment Response:", response);
        try {
          const verificationResponse = await fetch(`${url}/api/order/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.receipt,
            }),
          });

          const verificationResult = await verificationResponse.json();
          console.log("Verification Result:", verificationResult);

          if (verificationResponse.ok && verificationResult.success) {
            console.log("Payment successful!");

            await clearCart();

            setData({
              firstName: "",
              lastName: "",
              email: "",
              street: "",
              city: "",
              state: "",
              ZipCode: "",
              country: "",
              phone: "",
            });

            navigate("/myorders");
          } else {
            console.error("Payment verification failed.");
            await fetch(`${url}/api/order/delete`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ orderId: order.receipt }),
            });
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          await fetch(`${url}/api/order/delete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId: order.receipt }),
          });
        }
      },
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phone,
      },
      theme: {
        color: "#F37254",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', async function (response) {
      console.error("Payment failed:", response.error);
      await fetch(`${url}/api/order/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.receipt }),
      });
    });
    rzp.open();
  };

  return (
    <div className="place-order-container">
      <div className="delivery-info">
        <h2 className="section-title">Delivery Information</h2>
        <form onSubmit={placeOrder} className="delivery-form">
          {[
            "firstName",
            "lastName",
            "email",
            "street",
            "phone",
          ].map((field) => (
            <div className="form-group" key={field}>
              <label htmlFor={field}>
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                id={field}
                name={field}
                onChange={onChangeHandler}
                value={data[field]}
                required
                placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
              />
              {errors[field] && (
                <span className="error-message">{errors[field]}</span>
              )}
            </div>
          ))}

          {/* City field with suggestions */}
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              onChange={onChangeHandler}
              value={data.city}
              required
              placeholder="Enter City"
              autoComplete="off"
            />
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div className="suggestions">
                {citySuggestions.map((city, index) => (
                  <div 
                    key={index} 
                    className="suggestion-item"
                    onClick={() => handleCitySelect(city)}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
            {errors.city && (
              <span className="error-message">{errors.city}</span>
            )}
          </div>

          {/* State field */}
          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              type="text"
              id="state"
              name="state"
              onChange={onChangeHandler}
              value={data.state}
              required
              placeholder="Enter State"
            />
            {errors.state && (
              <span className="error-message">{errors.state}</span>
            )}
          </div>

          {/* ZipCode field */}
          <div className="form-group">
            <label htmlFor="ZipCode">Zip Code</label>
            <input
              type="text"
              id="ZipCode"
              name="ZipCode"
              onChange={onChangeHandler}
              value={data.ZipCode}
              required
              placeholder="Enter Zip Code"
            />
            {errors.ZipCode && (
              <span className="error-message">{errors.ZipCode}</span>
            )}
          </div>
          
          {/* Error message for unavailable delivery area */}
          {(errors.city && errors.city.includes("contact us")) || 
           (errors.ZipCode && errors.ZipCode.includes("contact us")) ? (
            <div className="pincode-error">
              <p>
                Delivery not available in this area. Please <Link to="/Contact_us">contact us</Link> for more information.
              </p>
            </div>
          ) : null}
        </form>
      </div>

      <div className="cart-totals">
        <h2 className="section-title">Cart Total</h2>
        <div className="summary-details">
          <p>
            Subtotal: <span className="summary-value">Rs. {subtotal}</span>
          </p>
          <p>
            Delivery Fees:{" "}
            <span className="summary-value">Rs. {deliveryFee}</span>
          </p>
          <p className="total-amount">
            Total: <span className="summary-value">Rs. {total}</span>
          </p>
          <button
            type="submit"
            className="proceed-btn"
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;