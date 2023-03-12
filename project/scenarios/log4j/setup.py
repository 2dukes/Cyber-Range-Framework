from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService
from webdriver_manager.firefox import GeckoDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Firefox(service=FirefoxService(GeckoDriverManager().install()))

driver.get("http://172.17.0.2:8080/")

driver.implicitly_wait(0.5)

driver.find_element(by=By.ID, value="tosAndEula").click()

driver.find_element(by=By.CSS_SELECTOR, value="button[type=submit]").click()

adv_setup = driver.find_element(by=By.XPATH, value="//span[text()='Switch to Advanced Setup']//parent::button")
# adv_setup = driver.find_element(by=By.CSS_SELECTOR, value="button._31I25tQNy3KTTCsayVZ7ok:nth-child(4)")
adv_setup.click()

# WebDriverWait(driver, 1000000).until(EC.((By.ID, "cloudAccessEnabled"))).click()

driver.find_element(by=By.CSS_SELECTOR, value="label[for=cloudAccessEnabled]").click()
driver.find_element(by=By.CSS_SELECTOR, value="label[for=ubiquitiLoginEnabled]").click()

driver.find_element(by=By.ID, value="localAdminUsername").send_keys("test_user_123")
driver.find_element(by=By.ID, value="localAdminPassword").send_keys("Test_User_123_456__")
driver.find_element(by=By.ID, value="localAdminPasswordConfirm").send_keys("Test_User_123_456__")
driver.find_element(by=By.ID, value="localAdminEmail").send_keys("admin@hotmail.com")
driver.find_element(by=By.CSS_SELECTOR, value="button[type=submit]").click()

driver.find_element(by=By.CSS_SELECTOR, value="label[for=optimizeNetworkEnabled]").click()
driver.find_element(by=By.CSS_SELECTOR, value="label[for=autoBackupEnabled]").click()
driver.find_element(by=By.CSS_SELECTOR, value="button[type=submit]").click()

driver.find_element(by=By.CSS_SELECTOR, value="button[type=submit]").click()

driver.find_element(by=By.XPATH, value="//button[text()='Skip']").click()

driver.find_element(by=By.CSS_SELECTOR, value="button[type=submit]").click()

driver.quit()