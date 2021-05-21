#include <PxMatrix.h>

#include <Ticker.h>
Ticker display_ticker;
#define P_LAT 16
#define P_A 5
#define P_B 4
#define P_C 15
#define P_D 12
#define P_E 0
#define P_OE 2

#define matrix_width 64
#define matrix_height 64

// This defines the 'on' time of the display is us. The larger this number,
// the brighter the display. If too large the ESP will crash
uint8_t display_draw_time=60; //30-70 is usually fine

PxMATRIX display(64,64,P_LAT, P_OE,P_A,P_B,P_C,P_D,P_E);

// ISR for display refresh
void display_updater()
{
  display.display(display_draw_time);
}

void display_update_enable(bool is_enable)
{

  if (is_enable)
    display_ticker.attach(0.004, display_updater);
  else
    display_ticker.detach();

}

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// Enter your wifi network name and Wifi Password
const char* ssid = "";
const char* password = "";


void setup() {

 Serial.begin(9600);
  // Define your display layout here, e.g. 1/8 step, and optional SPI pins begin(row_pattern, CLK, MOSI, MISO, SS)
  display.begin(32);
  display.setFlip(true);

  display_update_enable(true);
  display.clearDisplay();

  // Connect to Wi-Fi network with SSID and password
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
  delay(500);
  Serial.print(".\n");
  }
  // Print local IP address and start web server
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

}



void loop() {

  getData();
  delay(4000);

}

// hacky fix to calibrate incorrect row scanning
int getY(uint8_t yCoord){
  if((yCoord-2) % 8 == 0 || (yCoord -3) % 8 == 0){
    return yCoord +2;
  }
  else if((yCoord -4) % 8 == 0 || (yCoord -5) % 8 == 0){
    return yCoord -2;
  }
  else return yCoord;
}

void getData(){
  if (WiFi.status() == WL_CONNECTED) { //Check WiFi connection status
 
    HTTPClient http;  //Declare an object of class HTTPClient
 
    http.begin("http://www.iot-led-matrix.com/getColour/");  //Specify request destination
    int httpCode = http.GET();                                  //Send the request
 
    if (httpCode > 0) { //Check the returning code
 
      String payload = http.getString();   //Get the request response payload
      sendString(payload);
 
    }
    else{
      Serial.println(httpCode);
    }
 
    http.end();   //Close connection
 
  }
 
}


void sendString(String s){
  Serial.println("sending string");
  Serial.print("length: ");
  Serial.println(s.length());
  Serial.println(s[96]);
  Serial.println();
  for(int i =0; i < 32; i++){
    Serial.print(s[i]);
  }
  Serial.println();
  for(int i =s.length()-33; i < s.length()-1; i++){
    Serial.print(s[i]);
  }
  Serial.flush();

  int x = 0; 
  int y =0;
  int count = 0;
  int r =0;
  int g = 0;
  int b = 0;
  for(int i =1; i < s.length(); i++){
    if((i) % 3 == 0){
      //red
      r = s[i]- '0';
    }
    else if((i) % 3 == 1){
      g = s[i]- '0';
    }
    else if((i) % 3 == 2){
      b = s[i] - '0';
      //blue
      uint16_t colour = display.color565(r*255, g*255, b*255);
      
      display.drawPixel(x, getY(y), colour);
//      delay(5);
      x++;
      
    }
    if(x >= 64){ 
      x = 0;
      y++;
    }
    
  }
  
  }

  
